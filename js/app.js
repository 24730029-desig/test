const $=s=>document.querySelector(s);
const FIELDS=[...new Set((window.CERTIFICATES_DATA||[]).map(c=>c.field))],ELIGS=['제한없음','응시자격 확인 필요'],DIFFS=[1,2,3];
// 상위 탭(분야) > 하위 탭(세부 분야). 하위 분야는 자격증 이름으로 분류합니다.
const SUBS={
 'IT/컴퓨터':[['보안·네트워크',/정보보안|정보통신|네트워크|무선|방송통신|전파|리눅스/],['데이터',/SQL|데이터|빅데이터/],['개발·SW',/정보처리|전자계산기|SW코딩|게임프로그래밍|웹디자인/],['사무·디자인',/ITQ|컴퓨터활용|워드|GTQ|CAD|멀티미디어|게임그래픽|게임기획|사무자동화|정보기기/]],
 '어학':[['영어',/TOEIC|TOEFL|IELTS|OPIc 영어|G-TELP|FLEX 영어|TEPS|ESPT|PELT/],['일본어',/JPT|JLPT|일본어/],['중국어',/HSK|TSC|중국어/],['기타 외국어',/DELF|DALF|독일어|TestDaF|TORFL|스페인어/]],
 '전문직':[['법·회계·세무',/공인회계|세무사|변리사|노무사|감정평가|관세사|법무사|행정사|가맹거래사|손해사정|보험|지도사/],['부동산·유통',/공인중개|주택관리|물류|유통관리/],['상담·복지·교육',/사회복지|청소년|직업상담|심리|평생교육|보육/],['의료·보건',/간호|치료사|임상병리|방사선|치과위생/]],
 '공기업':[['한국사·국어',/한국사|국어|KBS|글쓰기/],['금융·투자',/신용분석|여신|외환|펀드|증권|파생|투자|금융/],['회계·세무',/회계|세무|재경|전산세무|FAT|TAT|ERP|매경|한경|경영정보/],['사무·무역',/속기|비서|한자|무역|전자상거래/]],
 '사무/자격':[['컴퓨터·OA',/컴퓨터활용|워드|ITQ|GTQ|DIAT|MOS|ICDL|정보보안관리사/],['ERP·실무',/ERP|문서실무|CS|텔레마케팅|비서|유통관리|무역/],['한자',/한자/]],
 '기타':[['자동차',/자동차/],['건설기계',/건설기계|굴착기|지게차|로더|롤러|불도저|크레인|기중기|양화장치/],['기계·설비',/공조|용접|에너지|배관|가스|위험물/],['전기·철도·승강기',/전기|철도|승강기/],['농림·조경',/산림|조경|식물|종자|유기농/]]
};
// 대학생 인기 순위(편집 기준: 취업·졸업요건·응시자 수 등을 고려한 큐레이션). 앞에 있을수록 인기. 목록에 없는 자격증은 뒤로 갑니다.
const POP=["TOEIC", "컴퓨터활용능력 2급", "한국사능력검정시험 심화", "컴퓨터활용능력 1급", "OPIc 영어", "TOEIC Speaking", "정보처리기사", "한국사능력검정시험 기본", "전산회계 1급", "전산세무 2급", "매경TEST", "한경TESAT", "SQL 개발자(SQLD)", "데이터분석 준전문가(ADsP)", "빅데이터분석기사", "공인회계사(CPA)", "공인중개사", "사회복지사 1급", "JLPT N2", "JLPT N1", "HSK 4급", "HSK 5급", "TEPS", "TOEFL iBT", "IELTS Academic", "정보처리산업기사", "정보보안기사", "네트워크관리사 2급", "리눅스마스터 2급", "GTQ 포토샵 1급", "정보기술자격(ITQ) 한글엑셀", "전산회계 2급", "재경관리사", "FAT 1급", "TAT 2급", "투자자산운용사", "펀드투자권유자문인력", "증권투자권유자문인력", "세무사", "공인노무사", "감정평가사", "한자능력검정시험 3급", "유통관리사 2급", "물류관리사", "무역영어 1급", "간호사", "청소년지도사 2급", "전기기능사", "지게차운전기능사", "TOEIC Writing", "G-TELP Level 2", "FLEX 영어", "JLPT N3", "HSK 6급", "DELF B2", "ERP정보관리사 회계", "전자상거래관리사 2급", "직업상담사 2급", "보육교사 2급", "평생교육사 2급", "컴퓨터활용능력 1급(대한상공회의소)", "워드프로세서"];
const popRank=c=>{const i=POP.indexOf(c.name);return i<0?1000+c.id:i};
const subsOf=f=>(SUBS[f]||[]).map(x=>x[0]);
const subOf=(f,n)=>{const h=(SUBS[f]||[]).find(x=>x[1].test(n));return h?h[0]:'기타'};
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const p2=n=>String(n).padStart(2,'0');
const isoOff=o=>{const d=new Date(TODAY);d.setDate(d.getDate()+o);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const dd=iso=>Math.round((new Date(iso+'T00:00:00')-TODAY)/864e5);
const D=n=>n===9999?'일정 미정':n===0?'D-DAY':n<0?'D+'+Math.abs(n):'D-'+n;
const dots=n=>'●'.repeat(n)+'○'.repeat(3-n);
const md=iso=>iso.slice(5).replace('-','.');
const won=n=>n==null?'확인 필요':Number(n).toLocaleString()+'원';
const lsGet=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const S={q:'',f:{field:'',sub:'',elig:'',diff:''},sort:'deadline',menu:'',certs:[],status:'loading',dataSource:'J',tab:'home',my:'dday',delMode:false,delSel:[],modal:null,toast:'',failOnce:false,scroll:{}};
// ── 저장소 계층: 모든 목표 D-Day / 취득 상태 읽기·쓰기는 여기만 거칩니다. ──
const SYNC_KEYS=['targetExams','myCertStatus'];
const syncHooks=[];                       // (key, value) => void : 클라우드 저장 함수가 여기에 등록됨
const store={
  get:(k,f)=>lsGet(k,f),
  set(k,v){lsSet(k,v);if(SYNC_KEYS.includes(k))syncHooks.forEach(fn=>{try{fn(k,v)}catch(e){console.warn('sync hook 실패(로컬 저장은 유지)',e)}})}
};
const getT=()=>store.get('targetExams',[]),getS=()=>store.get('myCertStatus',{});
const setT=v=>store.set('targetExams',v),setS=v=>store.set('myCertStatus',v);
const tId=s=>+s.split(':')[0],tR=s=>s.split(':')[1];
const byId=id=>S.certs.find(c=>c.id===id);
const nextR=c=>c.rounds.filter(r=>dd(r.examDate)>=0).sort((a,b)=>a.examDate<b.examDate?-1:1)[0];
const dayOf=c=>{const r=nextR(c);return r?dd(r.examDate):9999};
const dDayLabel=c=>{const r=nextR(c);return r?D(dd(r.examDate)):''};
const scheduleLabel=c=>{const t=c.scheduleType||'';if(t==='continuous')return '상시';if(t==='multiple_sessions')return '수시';if(t==='scheduled'||t==='scheduled_periodic')return '정기';if(t==='not_in_next_round')return '일정 발표 전';if(t==='unverified')return '일정 확인 필요';const st=c.researchStatus?.schedule||'';if(st==='상시')return '상시';if(st.startsWith('연중 시험일'))return '수시';if(st==='이번 회차 미시행')return '일정 발표 전';if(st==='정기 일정(5·8·11월 등) 확인')return '정기';if(st==='공식 일정 확인 완료')return '일정 발표 전';return '일정 확인 필요'};
const dLabel=c=>dDayLabel(c)||scheduleLabel(c);
const sourceIcon=c=>`<span class="source-icon ${c.dataSource==='A'?'api':''}" title="${c.dataSource==='A'?'API 응답':'JSON 데이터'}" aria-label="${c.dataSource==='A'?'API 응답':'JSON 데이터'}">${c.dataSource==='A'?'A':'J'}</span>`;
const statusClass=c=>{const v=scheduleLabel(c);return ['상시','수시'].includes(v)?'status-open':v==='정기'?'status-regular':v==='일정 발표 전'?'status-pending':'status-check'};
const noScheduleText=c=>{const st=c.researchStatus?.schedule||'';if(st==='상시')return '상시시험입니다. 지역·시험장별 개설 일정과 접수 가능 여부를 공식 페이지에서 확인하세요.';if(st==='이번 회차 미시행')return c.scheduleNote||'이번 회차는 시행하지 않습니다. 다음 회차 공지를 확인하세요.';if(st.startsWith('연중 시험일'))return c.scheduleNote||'등급·지역별 시험일을 공식 일정표에서 확인하세요.';return c.scheduleNote||'아직 확인된 시험일이 없습니다. 공식 시행기관의 일정을 확인해 주세요.'};

function load(){S.status='loading';renderList();
  setTimeout(async()=>{
    try{
      if(S.failOnce){S.failOnce=false;throw new Error('network')}
      let raw,source='J';
      // 실제 API URL이 설정된 경우에만 A로 표시합니다. 기본은 로컬 JSON(J)입니다.
      if(window.CERTIFICATES_API_URL){
        const res=await fetch(window.CERTIFICATES_API_URL);
        if(!res.ok)throw new Error(res.status);
        raw=await res.json(); source='A';
      }else{
        try{
          const res=await fetch('./data/certificates.json');
          if(!res.ok)throw new Error(res.status);
          raw=await res.json(); source='J';
        }catch(jsonError){
          if(Array.isArray(window.CERTIFICATES_DATA)){raw=window.CERTIFICATES_DATA;source='J'}
          else throw jsonError;
        }
      }
      S.dataSource=source;
      S.certs=raw.map(c=>({...c, id:Number(c.id), name:c.name, field:c.field, sub:subOf(c.field,c.name), eligibility:c.eligibility, eligibilityText:c.eligibilityText||c.eligibility||'공식 안내를 확인해 주세요.', difficulty:Number(c.difficulty)||({초급:1,중급:2,고급:3}[c.level]||2), fee:c.fee??null, officialUrl:c.officialUrl||c.url||'', dataSource:source, rounds:(c.rounds||[]).map((r,i)=>({roundId:'r'+(i+1),applyStart:r[0],applyEnd:r[1],examDate:r[2]}))}));
      S.status='ready'
    }catch(e){S.status='error'}
    renderList();refresh()},100)}
function filtered(){const q=S.q.trim().toLowerCase();
  let l=S.certs.filter(c=>(!q||c.name.toLowerCase().includes(q))&&(!S.f.field||c.field===S.f.field)&&(!S.f.sub||c.sub===S.f.sub)&&(!S.f.elig||c.eligibility===S.f.elig)&&(!S.f.diff||c.difficulty===+S.f.diff));
  return l.sort(S.sort==='fee'?(a,b)=>(a.fee??Infinity)-(b.fee??Infinity):S.sort==='pop'?(a,b)=>popRank(a)-popRank(b):(a,b)=>dayOf(a)-dayOf(b))}

const cardH=(c,r)=>`<button class="card" data-act="open" data-id="${c.id}"><div class="row sp"><span class="t cert-name">${r?`<span class="rk">${r}</span>`:''}${c.name}${sourceIcon(c)}</span><span class="card-status"><span class="schedule-tag ${statusClass(c)}">${scheduleLabel(c)}</span>${dDayLabel(c)?`<span class="dd">${dDayLabel(c)}</span>`:""}</span></div>${badgesH(c)}</button>`;
const badgesH=(c,fee)=>`<div class="meta">${c.field} › ${c.sub} · ${c.eligibility} · 난이도 ${dots(c.difficulty)}${fee||S.sort==='fee'?' · '+won(c.fee):''}</div>`;
const empty=(t,s,btn)=>`<div class="empty"><p><b>${t}</b>${s}</p>${btn}</div>`;

function heroH(s,c,multi){
  const r=c.rounds.find(x=>x.roundId===tR(s))||nextR(c);
  if(!r)return `<button class="box hero" data-act="open" data-id="${c.id}"><div class="hero-top"><span class="sub">${c.name}</span></div><div class="dd">${dLabel(c)}</div></button>`;
  const a0=dd(r.applyStart),a1=dd(r.applyEnd),n=dd(r.examDate);
  const ap=a1<0?['접수 마감','closed']:a0>0?['접수까지 D-'+a0,'soon']:['접수 중 · 마감 D'+(a1===0?'-DAY':'-'+a1),'open'];
  const total=Math.max(1,dd(r.examDate)-Math.min(a0,0)),pct=Math.min(100,Math.max(4,Math.round((1-n/Math.max(n+30,30))*100)));
  return `<button class="box hero" data-act="open" data-id="${c.id}">
    <div class="hero-top"><span class="t">${c.name}</span><span class="hero-ap ${ap[1]}">${ap[0]}</span></div>
    <div class="dd">${D(n)}</div>
    <div class="hero-bar"><i style="width:${pct}%"></i></div>
    <div class="hero-info"><div><b>시험일</b>${r.examDate}</div><div><b>접수 기간</b>${md(r.applyStart)} ~ ${md(r.applyEnd)}</div></div>
    ${badgesH(c,true)}
  </button>${multi?'':`<button class="add-goal" data-act="nav" data-v="list">＋ 비교할 목표 시험 더 추가하기</button>`}`}

const GLYPH=[[/IT|컴퓨터/,'<rect x="12" y="16" width="36" height="25" rx="3"/><path d="M7 46h46M22 24l-4 4 4 4M38 24l4 4-4 4"/>'],[/어학/,'<path d="M10 14h40a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H29l-10 8v-8h-9a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3z"/><path d="M20 27h.1M30 27h.1M40 27h.1"/>'],[/전문/,'<rect x="8" y="20" width="44" height="28" rx="4"/><path d="M22 20v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5M8 34h44"/>'],[/공기업/,'<path d="M8 24L30 10l22 14M12 24v22M24 24v22M36 24v22M48 24v22M8 50h44"/>'],[/사무/,'<rect x="10" y="10" width="40" height="40" rx="4"/><path d="M10 22h40M10 34h40M24 10v40"/>']];
const glyphOf=f=>(GLYPH.find(g=>g[0].test(f))||[0,'<path d="M30 12L6 24l24 12 24-12zM16 30v12c0 4 28 4 28 0V30"/>'])[1];
const thumbH=c=>`<span class="th th${FIELDS.indexOf(c.field)%3}"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphOf(c.field)}</svg></span>`;
const IC={bm:'<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-6.5 8-6.5s7 2 8 6.5"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',bar:'<path d="M6 20v-6M12 20V8M18 20v-9"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',won:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 9l1.7 6 1.8-4.5 1.8 4.5 1.7-6M7.5 11.5h9"/>',heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 21h4"/>',help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',notice:'<path d="M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6"/>',doc:'<path d="M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};
const ic=(k,w=22)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const bmSvg=on=>`<svg width="24" height="24" viewBox="0 0 24 24" fill="${on?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round">${IC.bm}</svg>`;
const HERO_SVG=`<svg class="hv-art" viewBox="0 0 220 190" aria-hidden="true"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDF2E9"/><stop offset="1" stop-color="#B9E4D6"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#78CBB5"/><stop offset="1" stop-color="#245B4A"/></linearGradient></defs><ellipse cx="122" cy="108" rx="92" ry="76" fill="url(#g1)" opacity=".7"/><circle cx="200" cy="128" r="28" fill="#CFEDE3" opacity=".6"/><g transform="rotate(-8 105 112)"><rect x="40" y="72" width="128" height="88" rx="14" fill="#fff" stroke="#E3ECE8" stroke-width="2"/><rect x="56" y="90" width="62" height="9" rx="4.5" fill="#E4EFEA"/><rect x="56" y="108" width="48" height="9" rx="4.5" fill="#E4EFEA"/><rect x="56" y="126" width="34" height="9" rx="4.5" fill="#E4EFEA"/><path d="M136 142l-8 24 12-6 10 8 2-24z" fill="url(#g2)"/><circle cx="142" cy="134" r="22" fill="url(#g2)"/><circle cx="142" cy="134" r="14" fill="#DDF2E9"/><path d="M142 125l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7-5.2-4.8 7-.8z" fill="#245B4A"/></g><g><path d="M92 50l50-22 52 22-52 24z" fill="#26332F"/><path d="M114 64v20c0 8 56 8 56 0V60" fill="#34443F"/><path d="M186 54v30" stroke="#78CBB5" stroke-width="3" stroke-linecap="round"/><circle cx="186" cy="88" r="4" fill="#78CBB5"/></g><path d="M62 30l7 11M76 22l3 13" stroke="#78CBB5" stroke-width="4" stroke-linecap="round"/></svg>`;
const BM_ART=`<svg class="em-art" viewBox="0 0 200 160" aria-hidden="true"><defs><linearGradient id="gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4FA58C"/><stop offset="1" stop-color="#245B4A"/></linearGradient></defs><path d="M30 90c-6-40 30-72 76-66 44 6 72 40 60 76-12 34-60 44-98 30-22-8-34-22-38-40z" fill="#E3F4EE"/><path d="M78 30h46a8 8 0 0 1 8 8v82l-31-20-31 20V38a8 8 0 0 1 8-8z" fill="url(#gb)"/><path d="M101 52l5.4 11 12 1.7-8.7 8.5 2.1 12-10.8-5.7-10.8 5.7 2.1-12-8.7-8.5 12-1.7z" fill="#fff"/><path d="M158 40l4 6M166 34l1 7" stroke="#78CBB5" stroke-width="3" stroke-linecap="round"/></svg>`;
const rec=()=>lsGet('recentViewed',[]);
const addRec=id=>lsSet('recentViewed',[id,...rec().filter(x=>x!==id)].slice(0,20));
const isReg=id=>getT().some(s=>tId(s)===id);

const rowH=c=>{const on=isReg(c.id),dl=dDayLabel(c);return `<div class="rw" data-act="open" data-id="${c.id}" role="button" tabindex="0">${thumbH(c)}<div class="rw-b"><div class="rw-n">${c.name}</div><div class="rw-m"><span class="hv-tag">${c.sub||c.field}</span><span class="rw-d">${dl||scheduleLabel(c)}</span></div></div><button class="hv-bm${on?' on':''}" data-act="bm" data-id="${c.id}" aria-label="${c.name} 목표 ${on?'해제':'등록'}">${bmSvg(on)}</button></div>`};
const cardV=c=>{const on=isReg(c.id),dl=dDayLabel(c);return `<div class="hv-card" data-act="open" data-id="${c.id}" role="button" tabindex="0">${thumbH(c)}<div class="hv-body"><span class="hv-tag">${c.sub||c.field}</span><div class="hv-name">${c.name}</div><div class="hv-desc">${(c.tags||[]).slice(3,5).join(' · ')||c.eligibility}</div><div class="hv-pills"><span>${ic('bar',15)}난이도 ${c.difficulty}</span><span>${ic('cal',15)}${dl||scheduleLabel(c)}</span></div></div><button class="hv-bm${on?' on':''}" data-act="bm" data-id="${c.id}" aria-label="${c.name} 목표 ${on?'해제':'등록'}">${bmSvg(on)}</button></div>`};

function renderHome(){
  const TP=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>dayOf(a.c)-dayOf(b.c));
  let h=`<div class="hv"><div class="hv-top"><div class="hv-logo">Get<span>Pass</span><svg class="hv-spark" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#78CBB5" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M13 4l2 4M18 2l.5 4.5M21 8l-4 1.5"/></svg></div><div class="hv-ic"><button data-act="nav" data-v="my" aria-label="저장한 목록">${ic('bm',24)}</button><button data-act="nav" data-v="mp" aria-label="마이페이지">${ic('user',24)}</button></div></div>
  <div class="hv-hero"><div class="hv-copy"><h1>나에게 맞는<br><em>자격증</em>을<br>찾아보세요!</h1><p>GetPass와 함께,<br>더 가까워지는 취업 준비 ✨</p></div>${HERO_SVG}</div>
  <button class="hv-search" data-act="nav" data-v="list" data-focus="1"><span class="hv-si">${ic('search',22)}</span><span class="hv-ph">자격증 이름을 검색해보세요!</span></button>`;
  if(S.status==='error')h+=`<div class="box sub">자격증 정보를 불러오지 못했습니다. 저장한 목표는 유지됩니다.</div>`;
  else if(S.status==='loading')h+=`<div class="skel"></div>`;
  else{
    if(TP.length){const n=TP[0];h+=`<button class="hv-goal" data-act="open" data-id="${n.c.id}"><span class="hv-gd">${dLabel(n.c)}</span><span class="hv-gt"><b>${n.c.name}</b><i>가장 가까운 목표${TP.length>1?' · 외 '+(TP.length-1)+'건':''}</i></span><span class="hv-ga">${ic('arrow',18)}</span></button>`}
    const fs=[...FIELDS.filter(f=>f!=='기타'),'기타'];if(!S.hf||!fs.includes(S.hf))S.hf=fs[0];
    const list=S.certs.filter(c=>c.field===S.hf).sort((a,b)=>(!nextR(a)-!nextR(b))||popRank(a)-popRank(b)).slice(0,3);
    h+=`<div class="hv-sh"><h2>분야별 찾아보기</h2><button data-act="nav" data-v="cat">전체보기 ${ic('arrow',16)}</button></div><div class="hv-chips">${fs.map(f=>`<button class="hv-chip${S.hf===f?' on':''}" data-act="hfield" data-v="${f}">${f.replace('/',' · ')}</button>`).join('')}</div>
    <div class="hv-sh"><h2>추천 자격증</h2><button data-act="quick" data-v="${S.hf}">전체보기 ${ic('arrow',16)}</button></div>
    <div class="hv-list">${list.map(cardV).join('')}</div>`}
  h+=`</div>`;
  $('#v-home').innerHTML=h}

function renderCat(){
  const fs=[...FIELDS.filter(f=>f!=='기타'),'기타'],cnt=f=>S.certs.filter(c=>c.field===f).length;
  const top=S.certs.slice().sort((a,b)=>popRank(a)-popRank(b)).slice(0,3);
  $('#v-cat').innerHTML=`<div class="cv"><div class="cv-h"><button data-act="nav" data-v="home" aria-label="뒤로">${ic('back',24)}</button><h1>카테고리</h1><button data-act="nav" data-v="list" data-focus="1" aria-label="검색">${ic('search',24)}</button></div>
  <p class="cv-lead">분야를 선택하고<br>원하는 자격증을 찾아보세요!</p>
  <div class="cv-grid">${fs.map(f=>`<button class="cv-tile" data-act="quick" data-v="${f}"><svg width="34" height="34" viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${glyphOf(f)}</svg><b>${f.replace('/',' · ')}</b><i>${S.status==='ready'?cnt(f)+'개':''}</i></button>`).join('')}</div>
  <div class="hv-sh" style="margin-top:22px"><h2>인기 자격증 TOP 3</h2><button data-act="quick" data-v="">더보기 ${ic('arrow',16)}</button></div>
  <div class="cv-top">${top.map(c=>`<button class="cv-row" data-act="open" data-id="${c.id}">${thumbH(c)}<span class="cv-n"><b>${c.name}</b><i>${c.sub||c.field}</i></span><span class="cv-d">${dDayLabel(c)||scheduleLabel(c)}</span>${ic('chev',16)}</button>`).join('')}</div></div>`}

function menuH(k,label,opts,fmt){const cur=S.f[k];
  return `<button class="chip${cur?' on':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}">${label}${cur?': '+fmt(cur):''} ▾</button>`}

function renderList(){const el=$('#lb');
  if(S.status==='loading'){el.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';return}
  if(S.status==='error'){el.innerHTML=empty('자격증 데이터를 불러오지 못했습니다','네트워크 상태를 확인해 주세요. 저장한 목표와 취득 상태는 유지됩니다.',`<button class="btn" data-act="retry">다시 시도</button>`);return}
  const L=filtered(),anim=S.anim;S.anim=false;
  const hasF=S.f.field||S.f.elig||S.f.diff||S.q;
  const TABS=[['field','분야',()=>S.f.field?S.f.field+(S.f.sub?' › '+S.f.sub:''):''],['elig','응시자격',()=>S.f.elig],['diff','난이도',()=>S.f.diff?dots(+S.f.diff):'']];
  let h=`<div class="ftabs">${TABS.map(([k,l,v])=>`<button class="ftab${S.f[k]?' set':''}${S.menu===k?' open':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}">${v()||l} ▾</button>`).join('')}</div>`;
  if(S.menu){const chip=(a,v,on,t)=>`<button class="chip${on?' on':''}" data-act="${a}" data-v="${v}">${t}</button>`;let inner='';
    if(S.menu==='field'){
      inner=`<div class="opts">${['',...FIELDS].map(f=>chip('pick',f,S.f.field===f,f||'전체')).join('')}</div>`;
      if(S.f.field)inner+=`<div class="opts sub2"><span class="ol">세부</span>${['',...subsOf(S.f.field)].map(v=>chip('subf',v,S.f.sub===v,v||'전체')).join('')}</div>`;
    }else{const O=S.menu==='elig'?ELIGS:DIFFS;
      inner=`<div class="opts">${['',...O].map(v=>chip('pick',v,String(S.f[S.menu])===String(v)||(!S.f[S.menu]&&v===''),v===''?'전체':S.menu==='diff'?dots(v):v)).join('')}</div>`}
    h+=`<div class="panel${anim?' anim':''}">${inner}</div>`}
  h+=`<div class="rbar"><span class="cnt">총 <b>${L.length}</b>개의 자격증이 있어요!</span><span class="sorts"><button class="${S.sort==='deadline'?'on':''}" data-act="sort" data-v="deadline">마감 임박순</button><button class="${S.sort==='fee'?'on':''}" data-act="sort" data-v="fee">응시료순</button><button class="${S.sort==='pop'?'on':''}" data-act="sort" data-v="pop">인기순</button>${hasF?`<button data-act="reset" class="rs">초기화</button>`:''}</span></div>`;
  h+=L.length?`<div class="rwl">${L.map(rowH).join('')}</div>`:empty('선택하신 조건에 맞는 자격증이 없습니다','조건을 줄이거나 추천 분야로 다시 찾아보세요',`<button class="btn pr" data-act="reset">필터 초기화</button><div class="sub" style="margin:12px 0 6px">추천 분야</div><div class="chips" style="justify-content:center">${FIELDS.slice(0,3).map(f=>`<button class="chip" data-act="quick" data-v="${f}" data-keep="0">${f}</button>`).join('')}</div>`);
  el.innerHTML=h}

const emptySaved=()=>`<div class="em">${BM_ART}<b>저장한 자격증이 없어요!</b><p>관심 있는 자격증을 저장하고<br>나중에 다시 확인해보세요.</p><button class="btn pr" data-act="nav" data-v="list" data-focus="1">자격증 검색하기 ${ic('arrow',18)}</button></div>`;
const stOf=(st,id)=>st[id]||'준비중';

function renderMy(){
  const st=getS(),T=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>dayOf(a.c)-dayOf(b.c));
  const f=S.mf||'all',cnt={all:T.length,'준비중':T.filter(x=>stOf(st,x.c.id)==='준비중').length,'합격':T.filter(x=>stOf(st,x.c.id)==='합격').length};
  const L=T.filter(x=>f==='all'||stOf(st,x.c.id)===f);
  let h=`<div class="pg"><div class="pg-h"><h1>저장한 목록</h1>${T.length?`<button class="pg-act" data-act="resetAll">전체 초기화</button>`:''}</div>
  <div class="seg">${[['all','전체'],['준비중','준비중'],['합격','합격']].map(([k,l])=>`<button class="${f===k?'on':''}" data-act="mf" data-v="${k}">${l} (${cnt[k]})</button>`).join('')}</div>`;
  if(!T.length)h+=emptySaved();
  else if(!L.length)h+=`<div class="em sm"><b>해당하는 자격증이 없어요</b><p>다른 탭을 확인해보세요.</p></div>`;
  else h+=L.map(({s,c})=>{const r=c.rounds.find(r=>r.roundId===tR(s)),sv=stOf(st,c.id);return `<div class="sv"><button class="sv-main" data-act="open" data-id="${c.id}">${thumbH(c)}<span class="sv-b"><b>${c.name}</b><i>시험일 ${r?r.examDate:'-'}</i></span></button><div class="sv-r"><span class="my-dd${r?'':' sm'}">${r?D(dd(r.examDate)):dLabel(c)}</span><span class="sv-chips">${['준비중','합격'].map(v=>`<button class="chip${sv===v?' on':''}" data-act="status" data-id="${c.id}" data-v="${v}">${v}</button>`).join('')}</span></div><button class="xbtn" data-act="del" data-id="${c.id}" aria-label="${c.name} 삭제">×</button></div>`}).join('');
  $('#v-my').innerHTML=h+`</div>`}

function renderMp(){
  const st=getS(),n=Object.keys(st).filter(id=>byId(+id)).length,code=(()=>{try{return localStorage.getItem('passpick_sync_code')||''}catch(e){return ''}})();
  const M=[['heart','관심 자격증','nav','my'],['clock','최근 본 자격증','sub','recent'],['bell','알림 설정','sub','notif'],['help','고객센터','sub','help'],['notice','공지사항','sub','notice'],['doc','이용약관 및 개인정보처리방침','sub','terms']];
  $('#v-mp').innerHTML=`<div class="pg"><div class="pg-h"><h1>마이페이지</h1></div>
  <div class="prof"><span class="av">${ic('user',34)}</span><div><b>GetPass 사용자</b><small>${code?'연동 코드 '+code:'안녕하세요!'}</small></div></div>
  <button class="stat" data-act="sub" data-v="status"><span class="si">${ic('bar',22)}</span><span class="stt"><small>나의 자격증 준비 현황</small><b>${n}개</b></span>${ic('chev',18)}</button>
  ${window.PassPickSync?window.PassPickSync.renderCardHTML():''}
  <div class="menu">${M.map(([i,l,a,v])=>`<button class="mi" data-act="${a}" data-v="${v}"><span class="mi-i">${ic(i,20)}</span><span class="mi-t">${l}</span>${ic('chev',16)}</button>`).join('')}</div></div>`}

const NOTICES=[['GetPass 서비스를 시작했어요','2026.11.23','300개 자격증의 시험 조건과 일정을 한 곳에서 검색·비교하고, 목표 시험의 D-Day를 관리할 수 있습니다.'],['목표 D-Day 등록 방법','2026.11.23','자격증 카드의 북마크를 누르면 가장 가까운 회차가 목표 D-Day로 저장됩니다. 상세 화면의 "시험 일정" 탭에서 회차를 바꿀 수 있어요.'],['기기 간 동기화(연동 코드) 안내','2026.11.23','마이페이지에서 6자리 연동 코드를 만들면 다른 기기에서도 목표 D-Day와 취득 상태를 이어서 볼 수 있습니다. 코드는 직접 보관해 주세요.'],['시험 일정은 공식 사이트에서 꼭 확인하세요','2026.11.23','앱의 일정은 조사 시점의 정보입니다. 접수 전 반드시 공식 시행기관의 최신 공지를 확인해 주세요.']];
const FAQ=[['시험 일정이 공식 사이트와 달라요.','앱의 일정은 조사 시점 기준입니다. 일정이 바뀌었다면 공식 시행기관의 안내가 우선이에요. 상세 화면의 "공식 일정 안내" 링크를 이용해 주세요.'],['연동 코드는 무엇인가요?','회원가입 없이 기기 간 데이터를 맞추는 6자리 코드입니다. 마이페이지에서 만들 수 있고, 다른 기기에서 "코드 입력하기"로 연결해요. 코드를 잃어버리면 복구할 수 없어요.'],['저장한 목록이 사라졌어요.','데이터는 이 브라우저에 저장됩니다. 브라우저 데이터를 지우면 사라지니, 연동 코드를 만들어 두면 복구할 수 있어요.'],['취득 상태는 어디서 바꾸나요?','저장한 목록에서 자격증별 "준비중/합격"을 바꿀 수 있고, 마이페이지의 "나의 자격증 준비 현황"에서 모아서 볼 수 있어요.']];

function statusHtml(){
  const st=getS(),ids=Object.keys(st).map(Number).filter(byId),dm=S.delMode&&ids.length>0,sel=S.delSel.filter(id=>ids.includes(id));
  if(!ids.length)return `<div class="em sm"><b>아직 기록이 없어요</b><p>자격증을 저장하면 준비 상태가 여기에 모여요.</p></div>`;
  let h=dm?`<div class="row sp" style="margin:2px 0 4px"><label class="row" style="gap:8px;min-height:36px;cursor:pointer"><input type="checkbox" class="ck" data-act="selall" ${sel.length===ids.length?'checked':''}><span class="t" style="font-size:14px">전체 선택</span></label><button class="sub" data-act="delcancel" style="text-decoration:underline;min-height:34px">취소</button></div>`
    :`<div class="row sp" style="margin:2px 0 4px"><span class="sub">총 ${ids.length}건</span><button class="sub" data-act="delmode" style="text-decoration:underline;min-height:34px">삭제</button></div>`;
  const row=id=>{const c=byId(id);return dm
    ?`<label class="row" style="gap:10px;padding:12px 0;border-bottom:1px dashed var(--line);cursor:pointer"><input type="checkbox" class="ck" data-act="selone" data-id="${id}" ${sel.includes(id)?'checked':''}><span class="t" style="flex:1;min-width:0">${c.name}</span></label>`
    :`<div class="row sp" style="padding:11px 0;border-bottom:1px dashed var(--line)"><span class="t" style="flex:1;min-width:0">${c.name}</span><div class="chips" style="flex:0 0 auto;flex-wrap:nowrap">${['준비중','합격'].map(v=>`<button class="chip${st[id]===v?' on':''}" data-act="status" data-id="${id}" data-v="${v}">${v}</button>`).join('')}</div></div>`};
  h+=['준비중','합격'].map(g=>{const L=ids.filter(id=>st[id]===g);return `<div class="grp"><div class="grp-h"><span class="t">${g}</span><span class="sub">${L.length}건</span></div>${L.length?L.map(row).join(''):`<div class="sub grp-e">${g==='준비중'?'준비 중인 자격증이 없어요':'아직 합격한 자격증이 없어요'}</div>`}</div>`}).join('');
  if(dm)h+=`<div class="delbar"><button class="btn pr" data-act="delsel" ${sel.length?'':'disabled'}>선택 삭제 (${sel.length})</button></div>`;
  return h}

function renderSub(){
  const k=S.sub||'status',T={status:'나의 자격증 준비 현황',recent:'최근 본 자격증',notif:'알림 설정',help:'고객센터',notice:'공지사항',terms:'이용약관 및 개인정보처리방침'}[k];let b='';
  if(k==='status')b=statusHtml();
  else if(k==='recent'){const L=rec().map(byId).filter(Boolean);b=L.length?`<div class="rwl">${L.map(rowH).join('')}</div>`:`<div class="em sm"><b>최근 본 자격증이 없어요</b><p>자격증 상세를 열어보면 여기에 쌓여요.</p></div>`}
  else if(k==='notif'){const p=lsGet('notifPrefs',{start:true,dday:true});b=`<div class="menu">${[['start','접수 시작 알림'],['dday','시험 D-7 · D-1 알림']].map(([i,l])=>`<div class="mi"><span class="mi-t">${l}</span><button class="sw${p[i]?' on':''}" data-act="notif" data-k="${i}" role="switch" aria-checked="${!!p[i]}"><i></i></button></div>`).join('')}</div><p class="note">설정은 이 기기에 저장됩니다. 실제 알림 발송은 아직 지원하지 않아요.</p>`}
  else if(k==='notice')b=`<div class="nl">${NOTICES.map(([t,d,x])=>`<div class="ni"><b>${t}</b><small>${d}</small><p>${x}</p></div>`).join('')}</div>`;
  else if(k==='help')b=`<div class="hp-h"><svg class="em-art" viewBox="0 0 120 100" aria-hidden="true"><circle cx="60" cy="52" r="40" fill="#E3F4EE"/><path d="M36 58v-6a24 24 0 0 1 48 0v6" fill="none" stroke="#245B4A" stroke-width="6" stroke-linecap="round"/><rect x="28" y="56" width="12" height="20" rx="6" fill="#245B4A"/><rect x="80" y="56" width="12" height="20" rx="6" fill="#245B4A"/><path d="M86 76c0 8-10 12-24 12" fill="none" stroke="#245B4A" stroke-width="5" stroke-linecap="round"/></svg><b>궁금한 점이 있으신가요?</b><p>자주 묻는 질문을 확인해 보세요.</p></div><div class="menu">${FAQ.map(([q,a],i)=>`<div class="fq${S.faq===i?' open':''}"><button class="mi" data-act="faq" data-v="${i}"><span class="mi-t">${q}</span>${ic('chev',16)}</button>${S.faq===i?`<p>${a}</p>`:''}</div>`).join('')}</div>`;
  else b=`<div class="legal"><h3>이용약관</h3><p>GetPass는 자격증 시험 정보를 검색·비교하고 목표 일정을 관리하는 학습용 프로젝트입니다. 제공되는 일정과 요건은 참고용이며, 접수 전 공식 시행기관의 안내를 확인해야 합니다.</p><h3>개인정보처리방침</h3><p>이름, 연락처 등 개인정보를 수집하지 않습니다. 목표 D-Day와 취득 상태는 이 기기의 브라우저(localStorage)에 저장되고, 연동 코드를 만든 경우에 한해 해당 코드와 함께 클라우드(Firebase)에 저장됩니다. 연동을 해제하면 이 기기에서 코드가 삭제됩니다.</p></div>`;
  $('#v-sub').innerHTML=`<div class="pg"><div class="pg-h back"><button data-act="back" aria-label="뒤로">${ic('back',24)}</button><h1>${T}</h1><span></span></div>${b}</div>`}

function renderModal(){const m=S.modal,el=$('#modal');if(!m){el.innerHTML='';return}
  const c=byId(m.id),reg=getT().find(s=>tId(s)===c.id),rs=c.rounds.filter(r=>dd(r.examDate)>=0);
  const sel=m.roundId||(reg?tR(reg):(rs[0]?.roundId)),r=rs.find(x=>x.roundId===sel)||rs[0],tab=S.dtab||'info',on=!!reg;
  let body='';
  if(tab==='info')body=`<h3>시험 개요</h3><p>${c.overview||'등록된 소개가 없습니다.'}</p><div class="dp-kv"><b>응시료</b><span>${won(c.fee)}${c.feeDetails?`<small>${Object.entries(c.feeDetails).map(([k,v])=>`${k} ${won(v)}`).join(' · ')}</small>`:''}${c.feeBasis?`<small>${c.feeBasis}</small>`:''}${c.feeSourceUrl?`<small><a href="${c.feeSourceUrl}" target="_blank" rel="noopener noreferrer">공식 응시료 안내 ↗</a></small>`:''}</span></div><div class="dp-kv"><b>일정 확인</b><span>${c.researchStatus?.schedule||(c.rounds?.length?'확인 완료':'미확인')}${c.scheduleSourceUrl?`<small><a href="${c.scheduleSourceUrl}" target="_blank" rel="noopener noreferrer">공식 일정 안내 ↗</a></small>`:''}</span></div>`;
  else if(tab==='req')body=`<h3>응시 자격</h3><p>${c.eligibilityText}</p>${c.tags?.length?`<div class="dp-tags">${c.tags.map(t=>`<span>${t}</span>`).join('')}</div>`:''}`;
  else body=`<h3>회차별 일정 <small>(목표 회차 선택)</small></h3>${rs.length?rs.map((x,i)=>`<label class="rr"><input type="radio" name="rd" value="${x.roundId}" ${x.roundId===r?.roundId?'checked':''} data-act="round"><span><b>${i+1}회차</b> 접수 ${x.applyStart} ~${x.applyEnd}<br>시험일 ${x.examDate} · ${D(dd(x.examDate))}</span></label>`).join(''):`<div class="box sub">등록된 시험 일정이 없습니다. 공식 시행기관에서 최신 일정을 확인해 주세요.</div>`}${rs.length?(reg?`<button class="btn ln" data-act="unsave">✓ 목표로 등록됨 · 눌러서 취소</button>`:`<button class="btn" data-act="save">목표 D-Day 등록</button>`):''}`;
  el.innerHTML=`<div class="dp"><div class="dp-top"><button data-act="close" aria-label="뒤로">${ic('back',24)}</button><button class="hv-bm${on?' on':''}" data-act="dbm" aria-label="목표 ${on?'해제':'등록'}">${bmSvg(on)}</button></div>
  <div class="dp-art">${thumbH(c)}</div>
  <div class="dp-b"><span class="hv-tag">${c.sub||c.field}</span><h2>${c.name}${sourceIcon(c)}</h2><p class="dp-s">${(c.tags||[]).slice(3,5).join(' · ')||c.eligibility}</p>
  <div class="dp-stats"><div>${ic('bar',20)}<small>난이도</small><b>${c.difficulty}</b></div><div>${ic('cal',20)}<small>${r?'시험일까지':'일정'}</small><b>${r?D(dd(r.examDate)):scheduleLabel(c)}</b></div><div>${ic('won',20)}<small>응시료</small><b>${c.fee==null?'확인 필요':Number(c.fee).toLocaleString()+'원'}</b></div></div>
  <div class="dp-tabs">${[['info','시험 안내'],['req','자격 요건'],['sch','시험 일정']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-act="dtab" data-v="${k}">${l}</button>`).join('')}</div><div class="dp-c">${body}</div></div>
  <div class="dp-cta">${S.toast?`<div class="dp-toast">${S.toast}</div>`:''}<a class="btn pr" href="${c.officialUrl}" target="_blank" rel="noopener noreferrer">자격증 신청하기 ${ic('arrow',18)}</a></div></div>`}

function refresh(){renderHome();renderMy();if(S.status==='ready')renderList();if(S.tab==='sub')renderSub();if(S.tab==='mp')renderMp()}
function save(){const m=S.modal,c=byId(m.id),T=getT().filter(s=>tId(s)!==c.id),nr=nextR(c);if(!nr)return;const r=m.roundId||nr.roundId;
  T.push(c.id+':'+r);setT(T);const st=getS();if(!st[c.id]){st[c.id]='준비중';setS(st)}}
let tt;function toast(t){S.toast=t;clearTimeout(tt);tt=setTimeout(()=>{S.toast='';renderModal()},2800)}

function nav(v){const cur=document.querySelector('.view:not([hidden])');if(cur)S.scroll[S.tab]=cur.scrollTop;if(v==='list'&&S.tab!=='list')S.from=S.tab;S.tab=v;document.body.dataset.tab=v;
  document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!=='v-'+v);
  const nb={home:'home',cat:'cat',list:'cat',my:'my',mp:'mp',sub:'mp'}[v];
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===nb));
  if(v==='home')renderHome();if(v==='cat')renderCat();if(v==='my')renderMy();if(v==='mp')renderMp();if(v==='sub')renderSub();$('#v-'+v).scrollTop=S.scroll[v]||0}
const rr=()=>{if(S.tab==='sub')renderSub();else if(S.tab==='my')renderMy();else if(S.tab==='mp')renderMp()};

document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,d=b.dataset;
  if(b.type!=='radio'&&b.tagName==='INPUT')return;
  switch(a){
  case'nav':nav(d.v);if(d.focus)setTimeout(()=>$('#q').focus(),60);break;
  case'hfield':S.hf=d.v;renderHome();break;
  case'bm':{e.stopPropagation();const c=byId(+d.id);if(isReg(c.id))setT(getT().filter(x=>tId(x)!==c.id));else if(nextR(c)){S.modal={id:c.id,roundId:null};save();S.modal=null}else{S.modal={id:c.id,roundId:null};S.dtab='sch';renderModal();break}refresh();break}
  case'sub':S.sub=d.v;S.faq=-1;S.delMode=false;S.delSel=[];nav('sub');break;
  case'back':nav('mp');break;
  case'cancel':nav(S.from&&S.from!=='list'?S.from:'home');break;
  case'mf':S.mf=d.v;renderMy();break;
  case'dtab':S.dtab=d.v;renderModal();break;
  case'faq':S.faq=S.faq===+d.v?-1:+d.v;renderSub();break;
  case'notif':{const p=lsGet('notifPrefs',{start:true,dday:true});p[d.k]=!p[d.k];lsSet('notifPrefs',p);renderSub();break}
  case'dbm':{const m=S.modal,c=byId(m.id);if(isReg(c.id)){setT(getT().filter(x=>tId(x)!==c.id));toast('등록이 취소되었습니다')}else if(nextR(c)){save();toast('목표 D-Day로 저장되었습니다')}else toast('시험 일정이 없어 등록할 수 없어요');renderModal();refresh();break}
  case'quick':S.f.field=d.v;S.f.sub='';S.menu='';if(d.keep==='0')S.q='',$('#q').value='';nav('list');renderList();break;
  case'top':S.anim=S.f.field!==d.v&&!!d.v;S.f.field=d.v;S.f.sub='';S.menu='';renderList();break;
  case'subf':S.f.sub=d.v;S.menu='';renderList();break;
  case'menu':S.anim=S.menu!==d.k;S.menu=S.menu===d.k?'':d.k;renderList();break;
  case'pick':if(S.menu==='field'){S.f.field=d.v;S.f.sub='';if(!d.v)S.menu=''}else{S.f[S.menu]=d.v;S.menu=''}renderList();break;
  case'clear':S.f[d.k]='';if(d.k==='field')S.f.sub='';renderList();break;
  case'reset':S.f={field:'',sub:'',elig:'',diff:''};S.q='';$('#q').value='';S.menu='';renderList();break;
  case'sort':S.sort=d.v;renderList();break;
  case'open':S.modal={id:+d.id,roundId:null};S.dtab='info';S.toast='';addRec(+d.id);renderModal();break;
  case'close':S.modal=null;S.toast='';renderModal();break;
  case'save':save();toast('목표 D-Day로 저장되었습니다');renderModal();refresh();break;
  case'syncCreate':window.PassPickSync?.createNewCode();break;
  case'syncJoin':{const code=prompt('다른 기기에서 발급받은 6자리 연동 코드를 입력하세요:');if(code)window.PassPickSync?.connectWithCode(code);break}
  case'syncPull':window.PassPickSync?.pull().then(ok=>{if(ok)alert('최신 클라우드 데이터를 불러왔습니다.')});break;
  case'syncDisconnect':window.PassPickSync?.disconnect();break;
  case'unsave':{const id=S.modal.id;setT(getT().filter(s=>tId(s)!==id));toast('등록이 취소되었습니다');renderModal();refresh();break}
  case'del':setT(getT().filter(s=>tId(s)!==+d.id));refresh();break;
  case'resetAll':if(confirm('등록된 목표 D-Day를 모두 삭제할까요?')){setT([]);refresh()}break;
  case'delmode':S.delMode=true;S.delSel=[];rr();break;
  case'delcancel':S.delMode=false;S.delSel=[];rr();break;
  case'delsel':{const n=S.delSel.length;if(n&&confirm('선택한 '+n+'개 자격증의 취득 상태를 삭제할까요?')){const st=getS();S.delSel.forEach(id=>delete st[id]);setS(st);S.delMode=false;S.delSel=[];toast(n+'개의 취득 상태가 삭제되었습니다');rr()}break}
  case'status':{const st=getS();st[d.id]=d.v;setS(st);rr();break}
  case'retry':load();break;
  case'demoErr':S.failOnce=true;load();break;
  case'resetData':if(confirm('저장된 목표 D-Day와 취득 상태를 모두 지울까요?')){setT([]);setS({});refresh();renderModal()}break}});

document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset&&t.dataset.act==='selall'){const ids=Object.keys(getS()).map(Number).filter(byId);S.delSel=t.checked?ids:[];rr();return}
  if(t.dataset&&t.dataset.act==='selone'){const id=+t.dataset.id;S.delSel=t.checked?[...new Set([...S.delSel,id])]:S.delSel.filter(x=>x!==id);rr();return}
  if(e.target.name==='rd'){const m=S.modal,c=byId(m.id);m.roundId=e.target.value;
  if(getT().some(s=>tId(s)===c.id)){save();toast('목표 회차가 변경되었습니다');refresh()}renderModal()}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.modal){S.modal=null;renderModal()}});

// pages/ 폴더의 화면 HTML을 불러온 뒤 앱을 시작합니다. (home → v-home, search → v-list, my → v-my)
const PAGES=['home','search','my','category','mypage','sub'];
async function loadPages(){
  const parts=await Promise.all(PAGES.map(async n=>{const r=await fetch('pages/'+n+'.html');if(!r.ok)throw new Error(n+' '+r.status);return r.text()}));
  $('#pages').innerHTML=parts.join('')}
loadPages().then(()=>{
  $('#q').addEventListener('input',e=>{S.q=e.target.value;if(S.status==='ready')renderList()});
  nav('home');load();
  window.PassPickSync?.init()
}).catch(()=>{$('#pages').innerHTML='<section class="view"><div class="box"><div class="t">화면 파일(pages/)을 불러오지 못했습니다</div><p class="sub" style="margin:8px 0">index.html을 더블클릭해서 열면 보안 때문에 pages/ 폴더를 읽을 수 없습니다. project 폴더에서 <b>python3 -m http.server 8000</b> 실행 후 <b>http://localhost:8000</b> 으로 열어 주세요. (GitHub Pages에서는 그대로 동작합니다.)</p></div></section>'});
