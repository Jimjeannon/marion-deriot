/**
 * Admin Script — Logique d'administration Marion Dériot
 * (Extrait du HTML pour meilleure maintenance)
 */

var AUTH = document.body.dataset.auth === 'true';
var SANITY_OK = document.body.dataset.sanity === 'true';

if (!AUTH) {
  document.getElementById('login-view').style.display = '';
  setTimeout(function () {
    document.getElementById('code-input').focus();
  }, 80);
} else {
  document.getElementById('admin-view').style.display = '';
  if (!SANITY_OK) {
    document.getElementById('sanity-notice').style.display = '';
  } else {
    document.getElementById('project-grid').style.display = '';
    initAdmin();
  }
}

// ─── Login ────────────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  var input = document.getElementById('code-input');
  var btn = document.getElementById('login-btn');
  var err = document.getElementById('login-error');
  var card = document.getElementById('login-card') || document.querySelector('.login-card');
  var code = input.value.trim();
  if (!code) return;
  btn.disabled = true;
  btn.textContent = '…';
  err.textContent = '';
  try {
    var res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    err.textContent = 'Code incorrect.';
    if (card) {
      card.classList.add('shake');
      card.addEventListener(
        'animationend',
        function () {
          card.classList.remove('shake');
        },
        { once: true }
      );
    }
    input.value = '';
    input.focus();
  } catch (ex) {
    err.textContent = 'Erreur réseau.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrer';
  }
});

document.addEventListener('dragover', function (e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'none';
});
document.addEventListener('drop', function (e) {
  e.preventDefault();
});

// ─── Admin ────────────────────────────────────────────────────────────────
function initAdmin() {
  var projects = [];
  var editing = null;
  var editGallery = [];

  var CATS = { residential: 'Résidentiel', commercial: 'Commercial', hospitality: 'Hôtelier', other: 'Autre' };

  // Skeleton de chargement
  document.getElementById('grid-loading').innerHTML = (function () {
    var out = '';
    for (var i = 0; i < 6; i++) {
      out +=
        '<div style="background:white;border:1px solid var(--color-greige-100);border-radius:6px;overflow:hidden">' +
        '<div class="skel" style="height:140px"></div>' +
        '<div style="padding:1rem"><div class="skel" style="height:10px;width:58%;margin-bottom:7px"></div>' +
        '<div class="skel" style="height:8px;width:36%;margin-bottom:13px"></div>' +
        '<div style="display:flex;gap:5px"><div class="skel" style="height:28px;width:68px"></div>' +
        '<div class="skel" style="height:28px;width:68px"></div></div></div></div>';
    }
    return out;
  })();

  // ── API ────────────────────────────────────────────────────────────────
  async function api(method, path, body) {
    var isForm = body instanceof FormData;
    var res = await fetch(path, {
      method: method,
      headers: isForm ? {} : body ? { 'Content-Type': 'application/json' } : {},
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.error || 'Erreur ' + res.status);
    return data;
  }

  // ── Upload XHR ──────────────────────────────────────────────────────────
  function uploadXHR(url, formData, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      if (xhr.upload) {
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }
      xhr.onload = function () {
        var data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch (ex) {
          data = {};
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || 'Erreur ' + xhr.status));
      };
      xhr.onerror = function () {
        reject(new Error('Erreur réseau'));
      };
      xhr.send(formData);
    });
  }

  function fmtSize(b) {
    if (b < 1024) return b + ' o';
    if (b < 1048576) return Math.round(b / 1024) + ' Ko';
    return (b / 1048576).toFixed(1) + ' Mo';
  }

  // ── Toast ────────────────────────────────────────────────────────────────
  function toast(msg, type) {
    type = type || 'ok';
    var wrap = document.getElementById('toast-wrap');
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 4500);
  }

  // ── Confirm ───────────────────────────────────────────────────────────────
  function showConfirm(title, msg) {
    return new Promise(function (resolve) {
      var el = document.createElement('div');
      el.className = 'confirm-overlay';
      el.style.cssText =
        'position:fixed;inset:0;background:rgba(44,43,41,.4);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem';
      el.innerHTML =
        '<div style="background:white;border:1px solid var(--color-greige-100);border-radius:6px;padding:2rem 1.5rem;max-width:340px;width:100%;text-align:center;box-shadow:var(--shadow-lg)" role="alertdialog">' +
        '<h3 style="font-family:var(--font-serif);font-size:1rem;font-weight:400;margin-bottom:0.5rem;color:var(--color-anthracite)">' +
        title +
        '</h3><p style="font-size:0.9rem;color:var(--color-greige-400);margin-bottom:1.5rem;line-height:1.6">' +
        msg +
        '</p>' +
        '<div style="display:flex;gap:0.75rem;justify-content:center">' +
        '<button class="btn" id="cd-no">Annuler</button>' +
        '<button class="btn btn-danger" id="cd-yes">Supprimer</button>' +
        '</div></div>';
      document.body.appendChild(el);
      function done(v) {
        el.remove();
        resolve(v);
      }
      el.querySelector('#cd-yes').onclick = function () {
        done(true);
      };
      el.querySelector('#cd-no').onclick = function () {
        done(false);
      };
      el.addEventListener('click', function (e) {
        if (e.target === el) done(false);
      });
    });
  }

  // ── Image URL ──────────────────────────────────────────────────────────────
  function thumbUrl(img, w) {
    w = w || 200;
    if (!img || !img.url) return '';
    return img.url + '?w=' + w + '&h=' + w + '&fit=crop&auto=format&q=82';
  }

  // ── Load Projects ──────────────────────────────────────────────────────────
  async function loadProjects() {
    showGrid('loading');
    try {
      projects = await api('GET', '/api/admin/projects');
      renderGrid();
    } catch (e) {
      showGrid('error', 'Erreur : ' + e.message);
    }
  }

  function showGrid(state, msg) {
    document.getElementById('grid-loading').style.display = state === 'loading' ? '' : 'none';
    document.getElementById('grid-cards').style.display = state === 'cards' ? '' : 'none';
    document.getElementById('grid-empty').style.display = state === 'empty' ? '' : 'none';
    var errEl = document.getElementById('grid-error');
    errEl.style.display = state === 'error' ? '' : 'none';
    if (msg) errEl.textContent = msg;
  }

  // ── Render Grid ────────────────────────────────────────────────────────────
  function renderGrid() {
    var cnt = document.getElementById('project-count');
    cnt.textContent = projects.length ? projects.length + ' projet' + (projects.length > 1 ? 's' : '') : '';
    if (!projects.length) {
      showGrid('empty');
      document.getElementById('btn-first').onclick = openNewProject;
      return;
    }
    var grid = document.getElementById('grid-cards');
    grid.innerHTML = projects.map(cardHtml).join('');
    showGrid('cards');
    grid.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openEdit(btn.dataset.edit);
      });
    });
    grid.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteProject(btn.dataset.del, btn.dataset.title);
      });
    });
  }

  function cardHtml(p) {
    var prev = (p.gallery || []).filter(function (i) {
      return i.isPreview;
    }).slice(0, 3);
    var imgs = prev.length ? prev : (p.gallery || []).slice(0, 2);
    var cls = imgs.length >= 3 ? 'three' : imgs.length === 1 ? 'one' : '';
    var thumbs = imgs.length
      ? imgs
          .map(function (i) {
            return '<div class="ct"><img src="' + thumbUrl(i, 320) + '" alt="" loading="lazy"/></div>';
          })
          .join('')
      : '<div class="ct"><div class="ct-empty">🖼️</div></div>';
    var meta = [CATS[p.category], p.year].filter(Boolean).join(' · ');
    var safeT = (p.title && p.title.fr || '').replace(/"/g, '&quot;');
    var dispFr = (p.title && p.title.fr) || '—';
    return (
      '<article class="project-card">' +
      '<div class="card-thumbs ' +
      cls +
      '">' +
      thumbs +
      '</div>' +
      '<div class="card-body">' +
      '<p class="card-title">' +
      dispFr +
      '</p>' +
      '<p class="card-meta">' +
      (meta || '&nbsp;') +
      '</p>' +
      '<div class="card-actions">' +
      '<button class="card-act" data-edit="' +
      p._id +
      '" title="Modifier">' +
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path d="M10 2l2 2-7 7-2.5.5.5-2.5L10 2z"/></svg>' +
      '</button>' +
      '<button class="card-act card-act-del" data-del="' +
      p._id +
      '" data-title="' +
      safeT +
      '" title="Supprimer">' +
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path d="M1.5 4h11"/><path d="M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4"/><path d="M2.5 4l.7 8.5h7.6l.7-8.5"/></svg>' +
      '</button>' +
      '</div></div></article>'
    );
  }

  // ── Delete Project ─────────────────────────────────────────────────────────
  async function deleteProject(id, title) {
    var ok = await showConfirm('Supprimer ce projet ?', '« ' + title + ' » sera définitivement supprimé.');
    if (!ok) return;
    try {
      await api('DELETE', '/api/admin/projects/' + id);
      toast('Projet supprimé.');
      await loadProjects();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function openNewProject() {
    editing = { _id: null, title: { fr: '', en: '' }, category: 'residential', year: null, gallery: [] };
    editGallery = [];
    document.getElementById('f-title-fr').value = '';
    document.getElementById('f-title-en').value = '';
    document.getElementById('f-category').value = 'residential';
    document.getElementById('f-year').value = '';
    openModal('Nouveau projet');
    renderGallery();
  }

  function openEdit(id) {
    editing = projects.find(function (p) {
      return p._id === id;
    });
    if (!editing) return;
    editGallery = (editing.gallery || []).slice();
    document.getElementById('f-title-fr').value = (editing.title && editing.title.fr) || '';
    document.getElementById('f-title-en').value = (editing.title && editing.title.en) || '';
    document.getElementById('f-category').value = editing.category || 'residential';
    document.getElementById('f-year').value = editing.year || '';
    openModal('Modifier : ' + ((editing.title && editing.title.fr) || id));
    renderGallery();
  }

  function openModal(title) {
    document.getElementById('modal-title').textContent = title;
    var eb = document.getElementById('modal-error-bar');
    if (eb) {
      eb.style.display = 'none';
      eb.textContent = '';
    }
    document.getElementById('modal-overlay').classList.add('open');
    setTimeout(function () {
      document.getElementById('f-title-fr').focus();
    }, 60);
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    editing = null;
    editGallery = [];
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', function (e) {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ── Gallery ────────────────────────────────────────────────────────────────
  function renderGallery() {
    var previews = editGallery.filter(function (i) {
      return i.isPreview;
    });
    var allImgs = editGallery.filter(function (i) {
      return !i.isPreview;
    });
    var prevCount = previews.length;
    var badge = document.getElementById('preview-count-badge');
    if (badge) {
      badge.textContent = prevCount + ' / 3';
      badge.style.color = prevCount === 0 ? 'var(--color-greige-400)' : 'var(--color-accent)';
    }
    renderSection('gallery-preview', previews, true, prevCount);
    renderSection('gallery-all', allImgs, false, prevCount);
  }

  var ICO_STAR_ON =
    '<svg width="13" height="13" viewBox="0 0 14 14" fill="var(--color-accent)" aria-hidden="true"><path d="M7 1l2.2 4.7h5.1l-4.1 3l1.6 4.9-4.8-3.5-4.8 3.5 1.6-4.9-4.1-3h5.1z"/></svg>';
  var ICO_STAR_OFF =
    '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M7 1l2.2 4.7h5.1l-4.1 3l1.6 4.9-4.8-3.5-4.8 3.5 1.6-4.9-4.1-3h5.1z"/></svg>';
  var ICO_TRASH =
    '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path d="M1.5 4h11"/><path d="M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4"/><path d="M2.5 4l.7 8.5h7.6l.7-8.5"/></svg>';
  var ICO_GRIP =
    '<svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor" aria-hidden="true"><circle cx="2.5" cy="2" r="1.2"/><circle cx="6.5" cy="2" r="1.2"/><circle cx="2.5" cy="6.5" r="1.2"/><circle cx="6.5" cy="6.5" r="1.2"/><circle cx="2.5" cy="11" r="1.2"/><circle cx="6.5" cy="11" r="1.2"/></svg>';

  function renderSection(containerId, images, isPreview, totalPrev) {
    var grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = images
      .map(function (img) {
        var gidx = editGallery.indexOf(img);
        if (img.isPending) {
          var pct = Math.round((img.progress || 0) * 100);
          return (
            '<div class="gimg' +
            (isPreview ? ' preview-on' : '') +
            '" style="position:relative;display:flex;align-items:center;justify-content:center">' +
            '<img src="' +
            img.localUrl +
            '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;opacity:.4;position:absolute;inset:0"/>' +
            '<div class="gimg-upload-wrapper">' +
            '<div style="width:70%;height:3px;background:rgba(255,255,255,.3);border-radius:2px;overflow:hidden"><div style="height:100%;width:' +
            pct +
            '%;background:white;transition:width 150ms ease-out;border-radius:2px"></div></div>' +
            '<span style="font-size:11px;color:rgba(255,255,255,.95);font-weight:600;letter-spacing:0.05em">' +
            pct +
            '%</span>' +
            '</div>' +
            '</div>'
          );
        }
        var url = thumbUrl(img, 280);
        var imgTag = url ? '<img src="' + url + '" alt="" loading="lazy"/>' : '<div style="width:100%;height:100%;background:var(--color-ivory)"></div>';
        var canMove = isPreview || totalPrev < 3;
        var moveTitle = isPreview ? 'Retirer des previews' : 'Marquer comme preview';
        return (
          '<div class="gimg' +
          (isPreview ? ' preview-on' : '') +
          '" draggable="true" data-gidx="' +
          gidx +
          '">' +
          imgTag +
          '<div class="gimg-overlay">' +
          '<button class="gimg-btn" data-action="move" data-gidx="' +
          gidx +
          '" title="' +
          moveTitle +
          '"' +
          (canMove ? '' : ' disabled') +
          '>' +
          (isPreview ? ICO_STAR_ON : ICO_STAR_OFF) +
          '</button>' +
          '<button class="gimg-btn" data-action="del" data-gidx="' +
          gidx +
          '" title="Supprimer">' +
          ICO_TRASH +
          '</button>' +
          '</div>' +
          (isPreview ? '' : '<span style="position:absolute;bottom:5px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.8);pointer-events:none;opacity:0;transition:opacity 180ms" class="gimg-handle">' + ICO_GRIP + '</span>') +
          '</div>'
        );
      })
      .join('');

    initDnD(grid, isPreview);
    grid.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var gidx = parseInt(btn.dataset.gidx, 10);
        if (btn.dataset.action === 'move') togglePreview(gidx);
        if (btn.dataset.action === 'del') removeImage(gidx);
      });
    });
  }

  function togglePreview(gidx) {
    var img = editGallery[gidx];
    if (!img) return;
    var cnt = editGallery.filter(function (i) {
      return i.isPreview;
    }).length;
    if (!img.isPreview && cnt >= 3) {
      toast('Maximum 3 images de preview. Retirez-en une d\'abord.', 'err');
      return;
    }
    img.isPreview = !img.isPreview;
    renderGallery();
  }

  async function removeImage(gidx) {
    var img = editGallery[gidx];
    if (!img) return;
    var key = img._key;
    editGallery.splice(gidx, 1);
    renderGallery();
    if (editing && editing._id && key) {
      try {
        await api('DELETE', '/api/admin/projects/' + editing._id + '/gallery', { key: key });
      } catch (e) {
        toast('Erreur suppression : ' + e.message, 'err');
        await refreshEditing();
      }
    }
  }

  function initDnD(grid, isPreviewSection) {
    var dragFrom = null;
    grid.querySelectorAll('.gimg[draggable="true"]').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        dragFrom = parseInt(item.dataset.gidx, 10);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', function () {
        item.classList.remove('dragging');
        grid.querySelectorAll('.gimg').forEach(function (i) {
          i.classList.remove('drag-over');
        });
      });
      item.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        grid.querySelectorAll('.gimg').forEach(function (i) {
          i.classList.remove('drag-over');
        });
        item.classList.add('drag-over');
      });
      item.addEventListener('dragleave', function () {
        item.classList.remove('drag-over');
      });
      item.addEventListener('drop', function (e) {
        e.preventDefault();
        var toGidx = parseInt(item.dataset.gidx, 10);
        if (dragFrom !== null && dragFrom !== toGidx) {
          var moved = editGallery.splice(dragFrom, 1)[0];
          var newTo = toGidx > dragFrom ? toGidx - 1 : toGidx;
          editGallery.splice(newTo, 0, moved);
          renderGallery();
        }
        dragFrom = null;
      });
    });
  }

  function initUploadZone(zoneId, inputId, zone, isPreview) {
    var el = document.getElementById(zoneId);
    var input = document.getElementById(inputId);
    if (!el || !input) return;
    input.addEventListener('change', function (e) {
      handleFiles(Array.from(e.target.files), isPreview, zone);
      input.value = '';
    });
    el.addEventListener('dragover', function (e) {
      e.preventDefault();
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', function () {
      el.classList.remove('drag-over');
    });
    el.addEventListener('drop', function (e) {
      e.preventDefault();
      el.classList.remove('drag-over');
      handleFiles(
        Array.from(e.dataTransfer.files).filter(function (f) {
          return f.type.startsWith('image/');
        }),
        isPreview,
        zone
      );
    });
  }

  initUploadZone('upload-zone-preview', 'upload-input-preview', 'preview', true);
  initUploadZone('upload-zone-gallery', 'upload-input-gallery', 'gallery', false);

  async function handleFiles(files, isPreview, zone) {
    if (!files.length) return;
    if (isPreview) {
      var curPrev = editGallery.filter(function (i) {
        return i.isPreview && !i.isPending;
      }).length;
      var remain = 3 - curPrev;
      if (remain <= 0) {
        toast('Maximum 3 images de preview.', 'err');
        return;
      }
      if (files.length > remain) {
        toast('Seulement ' + remain + ' image(s) encore disponible(s) en preview.', 'err');
        files = files.slice(0, remain);
      }
    }

    if (!editing || !editing._id) {
      var id = await saveProject(true);
      if (!id) return;
    }

    var savBtn = document.getElementById('modal-save');
    savBtn.disabled = true;

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var pendingKey = 'pending-' + Date.now() + '-' + i;
      var localUrl = URL.createObjectURL(file);
      var pendingItem = { _key: pendingKey, isPending: true, localUrl: localUrl, isPreview: isPreview, progress: 0 };
      if (isPreview) editGallery.unshift(pendingItem);
      else editGallery.push(pendingItem);
      renderGallery();

      try {
        var fd = new FormData();
        fd.append('image', file);
        fd.append('isPreview', isPreview ? 'true' : 'false');

        await uploadXHR('/api/admin/projects/' + editing._id + '/upload', fd, function (pct) {
          var img = editGallery.find(function (x) {
            return x._key === pendingKey;
          });
          if (img) img.progress = pct / 100;
        });

        var idx = editGallery.findIndex(function (x) {
          return x._key === pendingKey;
        });
        if (idx !== -1) editGallery.splice(idx, 1);
        URL.revokeObjectURL(localUrl);

        await refreshEditing();
        toast(isPreview ? 'Image de preview ajoutée.' : 'Image ajoutée à la galerie.');
      } catch (e) {
        var idx2 = editGallery.findIndex(function (x) {
          return x._key === pendingKey;
        });
        if (idx2 !== -1) editGallery.splice(idx2, 1);
        URL.revokeObjectURL(localUrl);
        renderGallery();
        toast('Erreur : ' + e.message, 'err');
      }
    }

    savBtn.disabled = false;
  }

  async function refreshEditing() {
    await loadProjects();
    var up = projects.find(function (p) {
      return editing && p._id === editing._id;
    });
    if (up) {
      editing = up;
      editGallery = (up.gallery || []).slice();
      renderGallery();
    }
  }

  document.getElementById('modal-save').addEventListener('click', function () {
    saveProject(false);
  });

  async function saveProject(silent) {
    var titleFr = document.getElementById('f-title-fr').value.trim().toUpperCase();
    var titleEn = document.getElementById('f-title-en').value.trim().toUpperCase();
    var category = document.getElementById('f-category').value;
    var yearRaw = document.getElementById('f-year').value;
    var year = yearRaw ? parseInt(yearRaw, 10) : null;
    var errBar = document.getElementById('modal-error-bar');
    errBar.style.display = 'none';
    errBar.textContent = '';

    if (!titleFr || !titleEn) {
      errBar.textContent = 'Les titres FR et EN sont obligatoires.';
      errBar.style.display = '';
      return null;
    }

    var savBtn = document.getElementById('modal-save');
    savBtn.disabled = true;
    savBtn.textContent = 'Sauvegarde…';

    try {
      if (!editing._id) {
        var body = { title: { fr: titleFr, en: titleEn }, category: category };
        if (year) body.year = year;
        var doc = await api('POST', '/api/admin/projects', body);
        editing._id = doc._id;
        if (!silent) toast('Projet créé.');
        await loadProjects();
        var up = projects.find(function (p) {
          return p._id === editing._id;
        });
        if (up) {
          editing = up;
          editGallery = (up.gallery || []).slice();
          document.getElementById('modal-title').textContent = 'Modifier : ' + titleFr;
          renderGallery();
        }
        return doc._id;
      } else {
        await api('PATCH', '/api/admin/projects/' + editing._id, {
          title: { fr: titleFr, en: titleEn },
          category: category,
          year: year,
        });
        var galToSave = editGallery.map(function (img) {
          var o = {};
          Object.keys(img).forEach(function (k) {
            if (k !== 'url' && k !== 'isPending' && k !== 'localUrl' && k !== 'progress') o[k] = img[k];
          });
          return o;
        });
        await api('PATCH', '/api/admin/projects/' + editing._id + '/gallery', { gallery: galToSave });
        toast('Modifications sauvegardées.');
        await loadProjects();
        if (!silent) closeModal();
        return editing._id;
      }
    } catch (e) {
      errBar.textContent = 'Erreur : ' + e.message;
      errBar.style.display = '';
      toast(e.message, 'err');
      return null;
    } finally {
      savBtn.disabled = false;
      savBtn.textContent = 'Sauvegarder';
    }
  }

  // ── Buttons ────────────────────────────────────────────────────────────────
  document.getElementById('btn-new-project').addEventListener('click', openNewProject);
  document.getElementById('btn-first') && document.getElementById('btn-first').addEventListener('click', openNewProject);
  document.getElementById('btn-logout').addEventListener('click', async function () {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin';
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  loadProjects();
}
