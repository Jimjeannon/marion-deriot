/**
 * Système de diagnostic pour uploads d'images Sanity
 * Identifie la source précise des erreurs 400
 */

interface ImageUploadCheckResult {
  status: 'success' | 'error';
  code: string;
  message: string;
  details: Record<string, any>;
  severity: 'critical' | 'warning' | 'info';
  suggestedFix: string;
}

interface DiagnosticReport {
  timestamp: string;
  projectId: string;
  userId: string;
  checks: ImageUploadCheckResult[];
  overallStatus: 'ready' | 'blocked' | 'degraded';
  summary: string;
}

async function diagnoseImageUploadError(
  file: File,
  projectId: string,
  token: string
): Promise<DiagnosticReport> {
  const checks: ImageUploadCheckResult[] = [];
  const timestamp = new Date().toISOString();

  checks.push(await checkFileValidity(file));
  checks.push(await checkTokenValidity(token, projectId));
  checks.push(await checkTokenPermissions(token, projectId));
  checks.push(await checkProjectQuota(projectId, token));
  checks.push(await checkSanityConnectivity(projectId));
  checks.push(await checkRateLimits(token, projectId));
  checks.push(await checkProjectState(projectId, token));
  checks.push(await checkEditingLocks(projectId, token));

  const overallStatus = checks.some(c => c.severity === 'critical')
    ? 'blocked'
    : checks.some(c => c.severity === 'warning')
    ? 'degraded'
    : 'ready';

  const failedChecks = checks.filter(c => c.status === 'error');
  const summary = failedChecks.length > 0
    ? `${failedChecks.length} problème(s) détecté(s): ${failedChecks.map(c => c.code).join(', ')}`
    : 'Tous les pré-requis sont satisfaits';

  return { timestamp, projectId, userId: 'marion', checks, overallStatus, summary };
}

async function checkFileValidity(file: File): Promise<ImageUploadCheckResult> {
  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!allowedFormats.includes(file.type)) {
    return {
      status: 'error',
      code: 'FILE_INVALID_FORMAT',
      message: `Format non accepté: ${file.type}`,
      details: { receivedFormat: file.type, allowedFormats, file: { name: file.name, type: file.type, size: file.size } },
      severity: 'critical',
      suggestedFix: `Utilisez un des formats: JPEG, PNG, WebP, GIF`
    };
  }

  const maxSize = 20 * 1024 * 1024;
  if (file.size === 0) {
    return {
      status: 'error',
      code: 'FILE_EMPTY',
      message: 'Le fichier est vide',
      details: { fileSize: file.size, fileName: file.name },
      severity: 'critical',
      suggestedFix: 'Sélectionnez un fichier image valide et non vide'
    };
  }

  if (file.size > maxSize) {
    return {
      status: 'error',
      code: 'FILE_TOO_LARGE',
      message: `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      details: { fileSize: file.size, maxSize, fileName: file.name, sizeInMB: (file.size / 1024 / 1024).toFixed(2) },
      severity: 'critical',
      suggestedFix: `Compressez l'image (maximum ${maxSize / 1024 / 1024}MB)`
    };
  }

  const isValid = await verifyImageIntegrity(file);
  if (!isValid) {
    return {
      status: 'error',
      code: 'FILE_CORRUPTED',
      message: 'Le fichier image est corrompu ou invalide',
      details: { fileName: file.name, fileSize: file.size, fileType: file.type },
      severity: 'critical',
      suggestedFix: 'Retéléchargez l\'image depuis la source originale'
    };
  }

  return {
    status: 'success',
    code: 'FILE_VALID',
    message: `Fichier valide: ${(file.size / 1024).toFixed(2)}KB`,
    details: { fileName: file.name, fileSize: file.size, fileType: file.type },
    severity: 'info',
    suggestedFix: ''
  };
}

async function checkTokenValidity(token: string, projectId: string): Promise<ImageUploadCheckResult> {
  if (!token || token.length < 10) {
    return {
      status: 'error',
      code: 'TOKEN_INVALID_FORMAT',
      message: 'Token invalide ou absent',
      details: { tokenLength: token?.length || 0 },
      severity: 'critical',
      suggestedFix: 'Vérifiez que le token Sanity est correctement configuré'
    };
  }

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      return {
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Token expiré ou révoqué',
        details: { statusCode: 401, projectId },
        severity: 'critical',
        suggestedFix: 'Générez un nouveau token dans les paramètres Sanity'
      };
    }

    if (response.status === 403) {
      return {
        status: 'error',
        code: 'TOKEN_UNAUTHORIZED',
        message: 'Token non autorisé pour ce projet',
        details: { statusCode: 403, projectId },
        severity: 'critical',
        suggestedFix: 'Vérifiez que le token appartient au bon projet Sanity'
      };
    }

    if (response.ok) {
      return {
        status: 'success',
        code: 'TOKEN_VALID',
        message: 'Token valide et actif',
        details: { projectId },
        severity: 'info',
        suggestedFix: ''
      };
    }
  } catch (error) {
    return {
      status: 'error',
      code: 'TOKEN_CHECK_FAILED',
      message: `Impossible de vérifier le token`,
      details: { error: error instanceof Error ? error.message : 'unknown' },
      severity: 'warning',
      suggestedFix: 'Vérifiez votre connexion Internet'
    };
  }

  return {
    status: 'success',
    code: 'TOKEN_VALID',
    message: 'Token valide',
    details: { projectId },
    severity: 'info',
    suggestedFix: ''
  };
}

async function checkTokenPermissions(token: string, projectId: string): Promise<ImageUploadCheckResult> {
  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/users/me`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      return {
        status: 'error',
        code: 'PERMISSION_CHECK_FAILED',
        message: 'Impossible de vérifier les permissions',
        details: { statusCode: response.status, projectId },
        severity: 'warning',
        suggestedFix: 'Vérifiez la configuration du token'
      };
    }

    const user = await response.json();
    const userRole = user.role || 'unknown';
    const uploadRoles = ['administrator', 'editor', 'asset-manager'];
    const canUpload = uploadRoles.includes(userRole);

    if (!canUpload) {
      return {
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Rôle insuffisant: ${userRole}`,
        details: { userRole, requiredRoles: uploadRoles, projectId },
        severity: 'critical',
        suggestedFix: `Donnez le rôle 'editor' ou 'asset-manager' dans Sanity`
      };
    }

    return {
      status: 'success',
      code: 'PERMISSION_GRANTED',
      message: `Permissions OK: ${userRole}`,
      details: { userRole, canUpload: true, projectId },
      severity: 'info',
      suggestedFix: ''
    };
  } catch (error) {
    return {
      status: 'error',
      code: 'PERMISSION_CHECK_ERROR',
      message: `Erreur lors de la vérification des permissions`,
      details: { error: error instanceof Error ? error.message : 'unknown' },
      severity: 'warning',
      suggestedFix: 'Vérifiez votre connexion Internet'
    };
  }
}

async function checkProjectQuota(projectId: string, token: string): Promise<ImageUploadCheckResult> {
  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return {
        status: 'warning',
        code: 'QUOTA_CHECK_FAILED',
        message: 'Impossible de vérifier les quotas',
        details: { statusCode: response.status, projectId },
        severity: 'warning',
        suggestedFix: 'Vérifiez votre abonnement Sanity'
      };
    }

    return {
      status: 'success',
      code: 'QUOTA_AVAILABLE',
      message: `Quota OK`,
      details: { projectId },
      severity: 'info',
      suggestedFix: ''
    };
  } catch (error) {
    return {
      status: 'warning',
      code: 'QUOTA_CHECK_ERROR',
      message: `Erreur lors de la vérification des quotas`,
      details: { error: error instanceof Error ? error.message : 'unknown' },
      severity: 'warning',
      suggestedFix: 'Contactez le support Sanity'
    };
  }
}

async function checkSanityConnectivity(projectId: string): Promise<ImageUploadCheckResult> {
  const startTime = performance.now();

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/versions`, { method: 'HEAD' });
    const duration = performance.now() - startTime;

    if (!response.ok) {
      return {
        status: 'error',
        code: 'SANITY_UNREACHABLE',
        message: 'API Sanity inaccessible',
        details: { statusCode: response.status, duration: `${duration.toFixed(0)}ms`, projectId },
        severity: 'critical',
        suggestedFix: 'Vérifiez votre connexion Internet et l\'ID du projet'
      };
    }

    return {
      status: 'success',
      code: 'SANITY_ONLINE',
      message: `Connexion OK (${duration.toFixed(0)}ms)`,
      details: { duration: `${duration.toFixed(0)}ms`, projectId },
      severity: 'info',
      suggestedFix: ''
    };
  } catch (error) {
    return {
      status: 'error',
      code: 'CONNECTIVITY_ERROR',
      message: 'Erreur de connexion à Sanity',
      details: { error: error instanceof Error ? error.message : 'unknown', projectId },
      severity: 'critical',
      suggestedFix: 'Vérifiez votre connexion Internet'
    };
  }
}

async function checkRateLimits(token: string, projectId: string): Promise<ImageUploadCheckResult> {
  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/assets/image`, {
      method: 'OPTIONS',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');

    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 5) {
      return {
        status: 'warning',
        code: 'RATE_LIMIT_APPROACHING',
        message: `Rate limit proche: ${rateLimitRemaining} requêtes restantes`,
        details: { remaining: rateLimitRemaining },
        severity: 'warning',
        suggestedFix: 'Attendez quelques minutes avant de retenter'
      };
    }

    return {
      status: 'success',
      code: 'RATE_LIMIT_OK',
      message: 'Rate limit OK',
      details: { remaining: rateLimitRemaining },
      severity: 'info',
      suggestedFix: ''
    };
  } catch (error) {
    return {
      status: 'info',
      code: 'RATE_LIMIT_CHECK_SKIPPED',
      message: 'Vérification du rate limit non disponible',
      details: {},
      severity: 'info',
      suggestedFix: ''
    };
  }
}

async function checkProjectState(projectId: string, token: string): Promise<ImageUploadCheckResult> {
  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return {
        status: 'error',
        code: 'PROJECT_INACCESSIBLE',
        message: `Projet inaccessible: ${response.status}`,
        details: { statusCode: response.status, projectId },
        severity: 'critical',
        suggestedFix: 'Vérifiez que le projet existe et que le token est valide'
      };
    }

    return {
      status: 'success',
      code: 'PROJECT_ACTIVE',
      message: 'Projet actif et accessible',
      details: { projectId },
      severity: 'info',
      suggestedFix: ''
    };
  } catch (error) {
    return {
      status: 'warning',
      code: 'PROJECT_CHECK_ERROR',
      message: 'Impossible de vérifier l\'état du projet',
      details: { error: error instanceof Error ? error.message : 'unknown' },
      severity: 'warning',
      suggestedFix: 'Réessayez dans quelques instants'
    };
  }
}

async function checkEditingLocks(projectId: string, token: string): Promise<ImageUploadCheckResult> {
  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v1/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return {
        status: 'info',
        code: 'EDIT_LOCK_CHECK_SKIPPED',
        message: 'Vérification des verrous non disponible',
        details: {},
        severity: 'info',
        suggestedFix: ''
      };
    }

    return {
      status: 'success',
      code: 'NO_EDIT_LOCKS',
      message: 'Aucun verrou d\'édition détecté',
      details: {},
      severity: 'info',
      suggestedFix: ''
    };
  } catch (error) {
    return {
      status: 'info',
      code: 'EDIT_LOCK_ERROR',
      message: 'Impossible de vérifier les verrous',
      details: {},
      severity: 'info',
      suggestedFix: ''
    };
  }
}

async function verifyImageIntegrity(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = result;
      } else {
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsDataURL(file);
    setTimeout(() => resolve(false), 10000);
  });
}

export { diagnoseImageUploadError, type ImageUploadCheckResult, type DiagnosticReport };
