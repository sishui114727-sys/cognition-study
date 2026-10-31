// 面板只读：读插件写在同一目录的 live-snapshot.json。
// 宿主没有把 ../@data/storage.json 映射出来（认知核心里实测过），
// 所以走同目录相对路径，示例文件也是这么被读到的。
const el = (id) => document.getElementById(id);

function setBadge(text, state) {
  const badge = el('state-badge');
  badge.textContent = text;
  badge.dataset.state = state;
}

function render(snapshot) {
  const { readings, fetch: fetchInfo, journal, notes, hasSessdata, lastError, lastFetch, generatedAt } = snapshot;

  el('readings-total').textContent = String(readings?.total ?? 0);
  el('readings-hint').textContent = readings?.total ? '已取稿，可按 id 读取' : '尚未取稿';

  el('fetch-today').textContent = String(fetchInfo?.today ?? 0);
  el('fetch-hint').textContent = `上限 ${fetchInfo?.limit ?? 6} 次/天`;

  el('journal-total').textContent = String(journal?.total ?? 0);
  el('journal-hint').textContent = `今日 ${journal?.today ?? 0} / 上限 ${journal?.dailyLimit ?? 2}`
    + (journal?.remaining === 0 ? '（今日已用完）' : '');

  el('journal-streak').textContent = `${journal?.streak ?? 0} 天`;
  el('journal-streak-hint').textContent = journal?.days
    ? `累计写了 ${journal.days} 天`
    : '还没有开始写';

  el('journal-chars').textContent = String(journal?.charsToday ?? 0);
  el('journal-chars-hint').textContent = `上限 ${journal?.charsLimit ?? 6000} 字/天`;

  el('notes-total').textContent = String(notes?.total ?? 0);

  el('sessdata-state').textContent = hasSessdata ? '有字幕' : '仅元信息';
  el('sessdata-state').style.color = hasSessdata ? 'var(--ok)' : 'var(--warn)';

  const verify = journal?.verify;
  if (!verify) {
    el('verify-line').textContent = '还没有手账，无需校验。';
  } else if (verify.ok) {
    el('verify-line').textContent = `通过：${verify.total} 篇 / ${verify.volumeCount} 卷 / 快照 ${verify.snapshot}`;
  } else {
    el('verify-line').textContent = `未通过：${(verify.problems ?? []).join('；')}`;
  }

  const extra = [];
  if (journal?.amendments) extra.push(`修订 ${journal.amendments} 条`);
  if (journal?.missingRefs) extra.push(`${journal.missingRefs} 篇引用的稿件已不存在`);
  if (journal?.lastDay) extra.push(`最近一篇 ${journal.lastDay}`);
  el('journal-extra').textContent = extra.length ? extra.join(' · ') : '还没有修订，也没有失效引用';

  el('last-fetch').textContent = lastFetch
    ? `最近取稿 ${lastFetch.at} · ${lastFetch.bvid} 第 ${lastFetch.page} P · `
      + (lastFetch.coverage === 'full' ? `${lastFetch.cues} 段字幕` : '仅元信息')
    : '还没有取过稿';

  el('last-error').textContent = lastError
    ? `最近错误 ${lastError.at}：${lastError.message}`
    : '';

  el('generated-at').textContent = generatedAt ? `快照时间 ${generatedAt}` : '';
  setBadge(hasSessdata ? '字幕可用' : '仅元信息', hasSessdata ? 'ok' : 'warn');
}

async function load() {
  try {
    const res = await fetch('live-snapshot.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    render(await res.json());
  } catch (error) {
    // 拿不到快照就如实说拿不到，不摆一堆 0 假装正常
    setBadge('无快照', 'bad');
    el('verify-line').textContent = `读不到 live-snapshot.json（${error.message}）。插件首次启用后会生成。`;
  }
}

load();