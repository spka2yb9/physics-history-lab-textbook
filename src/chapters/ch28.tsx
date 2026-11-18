import type { Chapter } from '../content/types'
import { ChapterLink, FigRef, Ref, Term } from '../components/content'
import { Who } from '../components/history'
import { FigBinding, FigChain, FigCharge, FigExile, FigMass, FigNumberLine, FigParaffin, FigPile, FigRoad28, FigSplit } from '../figures/ch28'

const chapter: Chapter = {
  key: '28',
  part: 'p6',
  title: '核分裂と原子爆弾',
  summary: '1938年12月、ウランに中性子を当てるとずっと軽いバリウムができることが見つかり、マイトナーとフリッシュはこれを原子核が2つに割れる現象だと解釈しました。この発見は連鎖反応と原子炉の研究につながり、第二次世界大戦の中で原子爆弾が作られ、広島と長崎に投下されました。',
  goals: [
    '中性子を当てる実験から、ウランの原子核が2つに割れると分かるまでの経緯を説明できる',
    '核分裂でエネルギーが出る理由を、質量とエネルギーの関係を使って説明できる',
    '連鎖反応が続く条件を、1回の核分裂から出る中性子の行き先を使って説明できる',
    'ナチス政権からの亡命、アインシュタインの手紙、マンハッタン計画のつながりを説明できる',
    '広島と長崎の被害の推計と、戦後の科学者の議論を説明できる',
  ],
  prerequisites: ['18', '27'],
  people: ['fermi', 'meitner', 'bohr', 'einstein', 'oppenheimer', 'yukawa'],
  events: [
    { year: 1934, title: '中性子を当てる実験', note: 'フェルミが多くの元素に中性子を当てて新しい放射性の原子を作り、パラフィンで遅くした中性子ほど原子核に取り込まれやすいことを見つけた。', people: ['fermi'], section: 'neutron' },
    { year: 1938, yearLabel: '1938〜1939年', title: '核分裂の発見', note: 'ハーンとシュトラスマンがウランからバリウムができたことを見つけ、マイトナーとフリッシュが原子核が2つに割れる現象だと解釈した。', people: ['meitner'], section: 'fission' },
    { year: 1942, title: '最初の原子炉', note: '12月2日、フェルミらのシカゴ・パイル1号で、核分裂の連鎖反応を制御しながら続けることに初めて成功した。', people: ['fermi'], section: 'chain' },
  ],
  sections: [
    {
      id: 'neutron',
      title: '中性子を当てる実験（1934年）',
      body: (
        <>
          <p>
            1930年代の初め、研究者は小さな粒子を原子核にぶつけて、原子核の変化を調べていました。しかし、よく使われたα線の粒子や陽子はプラスの電気を持つので、同じくプラスの電気を持つ原子核に押し返され、当たるのは100万回に1回ほどでした
            <Ref n={3} />。
          </p>
          <p>
            1932年に見つかった中性子は、原子核の中にある電気を持たない粒子です（<ChapterLink n="27" />）。ローマ大学の<Who id="fermi">エンリコ・フェルミ</Who>は1934年から中性子をいろいろな元素に当てました。中性子は押し返されずに原子核に近づけます（<FigRef n="28-1" />）。フェルミたちは63種類の元素に中性子を当て、放射能を持つ新しい原子を37種類作りました
            <Ref n={3} />
            <Ref n={2} />。
          </p>
          <FigCharge />
          <p>
            同じ年、フェルミたちは中性子をパラフィンや水に通すと、生まれる放射能が最大で100倍になることに気づきました。中性子と水素の原子核（陽子）は質量がほぼ等しく、ぶつかると勢いの多くが相手に移ります（<ChapterLink n="3" />）。中性子は水素の原子核に約20回ぶつかると、まわりの分子の熱運動と同じくらいまで遅くなります
            <Ref n={1} />。遅い中性子は原子核の近くに長くとどまるので、取り込まれやすくなります（<FigRef n="28-2" />）
            <Ref n={3} />
            <Ref n={8} />。
          </p>
          <FigParaffin />
          <p>
            フェルミたちはウランにも中性子を当て、ウランより重い93番と94番の元素ができたと考えました。フェルミは1938年12月12日のノーベル賞講演でも、この2つの元素の名前を紹介しています
            <Ref n={1} />。当時は、中性子が1個当たっても、原子核の中の陽子や中性子の数は少ししか変わらないと考えられていました。1934年に化学者のイダ・ノダックが、ウランがもっと軽い元素に壊れた可能性を指摘しましたが、ほとんど注目されませんでした
            <Ref n={4} />。
          </p>
        </>
      ),
    },
    {
      id: 'fission',
      title: 'ウランの原子核が2つに割れる（1938〜1939年）',
      body: (
        <>
          <p>
            ベルリンでは、物理学者の<Who id="meitner">リーゼ・マイトナー</Who>と化学者のオットー・ハーン、フリッツ・シュトラスマンが、ウランに中性子を当ててできる物質を調べていました。マイトナーは1938年7月にドイツを逃れてスウェーデンに移りましたが、ハーンとの手紙のやりとりは続けました
            <Ref n={4} />。
          </p>
          <p>
            1938年12月、ハーンとシュトラスマンはウランからできた物質の中に、バリウムのようにふるまうものを見つけました。ハーンは12月19日の手紙に「私たちのラジウムの同位体は、ラジウムではなくバリウムのようにふるまう」と書き、マイトナーに説明を求めました
            <Ref n={5} />。陽子が92個あるウランから、陽子が56個しかないバリウムができたことになります（<FigRef n="28-3" />）。
          </p>
          <FigNumberLine />
          <p>
            クリスマスの休みに、コペンハーゲンの<Who id="bohr">ニールス・ボーア</Who>の研究所で働く甥のオットー・フリッシュが、マイトナーを訪ねてきました。2人は雪の中を歩きながら、原子核を液体の滴のように考える模型を使って考えました。滴が揺れて細長く伸び、真ん中がくびれて2つに分かれるように、中性子を取り込んだウランの原子核も2つに分かれるという考えです。分かれた2つの原子核はどちらもプラスの電気を持つので、強く押し合って飛び離れます（<FigRef n="28-4" />）
            <Ref n={4} />。
          </p>
          <FigSplit />
          <p>
            マイトナーは、分かれたあとの2つの原子核の質量の合計が、もとのウランの原子核より陽子の約5分の1だけ小さいことに気づきました。質量とエネルギーは互いに移り変わるという関係（質量とエネルギーの等価性、<ChapterLink n="18" />
            ）でこの差をエネルギーに直すと、破片が飛び離れるエネルギーの見積もりとちょうど合いました（<FigRef n="28-5" />）
            <Ref n={4} />。このエネルギーは、炭素の原子1個が燃えるときに出るエネルギーの約5000万倍です
            <Ref n={8} />。
          </p>
          <FigMass />
          <p>
            フリッシュは生物の細胞の「分裂」にならって、この現象を fission と名づけました
            <Ref n={4} />。日本語では
            <Term def="ウランのような重い原子核が、中性子を取り込んだあと、中くらいの重さの2つの原子核に分かれる現象。分かれるときに大きなエネルギーと、2〜3個の中性子が出る。" en="nuclear fission">核分裂</Term>
            といいます。ハーンとシュトラスマンの論文は1939年1月6日に、マイトナーとフリッシュの論文は2月11日に発表されました
            <Ref n={5} />
            <Ref n={6} />。フェルミはノーベル賞講演を印刷するとき、ウランより重い元素の話は見直す必要があるという注を加えました
            <Ref n={1} />。核分裂の発見に対する1944年のノーベル化学賞は、ハーン1人に贈られました
            <Ref n={4} />。
          </p>
        </>
      ),
    },
    {
      id: 'chain',
      title: '連鎖反応と最初の原子炉（1939〜1942年）',
      body: (
        <>
          <p>
            1939年1月、ボーアは核分裂の知らせをアメリカに伝えました
            <Ref n={9} />。フェルミは、核分裂のときに中性子が飛び出せば、その中性子が次の原子核を割る可能性があることにすぐ気づきました
            <Ref n={2} />。実際、1回の核分裂では平均2〜3個の中性子が出ます
            <Ref n={7} />。このように核分裂が次々に続くことを
            <Term def="核分裂で出た中性子が次の原子核を割り、そこから出た中性子がさらに次の原子核を割る、というように核分裂が次々に続くこと。" en="chain reaction">連鎖反応</Term>
            といいます。
          </p>
          <p>
            ただし、出た中性子には外へ逃げるものや、割れない原子核などに吸収されるものもあります
            <Ref n={8} />。連鎖反応が続くかどうかは、1回の核分裂から出た中性子のうち、平均で何個が次の核分裂を起こすかで決まります（<FigRef n="28-6" />）。1個より多ければ核分裂の数は世代ごとに増え、1個より少なければやがて止まります。ちょうど1個で数が変わらない状態を
            <Term def="連鎖反応で、1回の核分裂から出た中性子のうち平均でちょうど1個が次の核分裂を起こし、核分裂の数が増えも減りもしない状態。" en="criticality">臨界</Term>
            といいます
            <Ref n={7} />。
          </p>
          <FigChain />
          <p>
            天然のウランのうち遅い中性子で割れるのは、140個に1個の割合で含まれるウラン235という同位体（陽子の数が同じで中性子の数が違う原子、<ChapterLink n="27" />
            ）です
            <Ref n={9} />。1942年12月2日、フェルミたちはシカゴ大学で、天然のウランと、中性子を遅くする黒鉛を積み上げたシカゴ・パイル1号の実験を行いました。中性子を吸い取るカドミウムの棒（制御棒）を少しずつ引き抜いていくと、午後3時25分、連鎖反応はそれだけで続く状態になりました。出力は約0.5ワットで、28分後に制御棒を戻して止めました
            <Ref n={10} />。核分裂の連鎖反応を制御しながら続けさせる装置を
            <Term def="核分裂の連鎖反応を、制御しながら続けさせる装置。中性子を吸い取る制御棒などで、核分裂の数が増えすぎないように調節する。" en="nuclear reactor">原子炉</Term>
            といい、これが最初の原子炉です。
          </p>
          <FigPile />
          <p>
            <FigRef n="28-7" />
            のように、次の核分裂を起こす中性子が平均1個より少ない間は、制御棒を引き抜くたびに中性子の数は増えますが、ある数で落ち着きます。1個を超えると増え続けます。この日の記録から求めた値は1.0006でした。その場にいたシラードは、この日は「人類の歴史の暗い日」として記憶されるだろうとフェルミに言ったと、のちに書いています
            <Ref n={10} />。
          </p>
        </>
      ),
    },
    {
      id: 'exile',
      title: 'ナチス政権からの亡命とアインシュタインの手紙（1933〜1939年）',
      body: (
        <>
          <p>
            話を1933年に戻します。この年の1月にドイツでナチス政権ができ、4月7日の法律で、ユダヤ系の人や政権に反対する人が、州立大学を含む公務員の職から追い出されました
            <Ref n={11} />。この章に登場する物理学者の多くが、この時期にドイツやイタリアを離れています（<FigRef n="28-8" />）。
          </p>
          <p>
            <Who id="einstein">アルベルト・アインシュタイン</Who>は1933年からアメリカのプリンストン高等研究所で研究しました
            <Ref n={14} />。ハンガリー出身の物理学者レオ・シラードは、1933年に中性子による連鎖反応を思いつき、同じ年にイギリスへ、1938年にアメリカへ移りました
            <Ref n={12} />。フリッシュは1933年にハンブルク大学の職を解かれ、ロンドンを経てコペンハーゲンへ移りました
            <Ref n={13} />。マイトナーは、1938年に故郷のオーストリアがドイツに併合されて迫害を受けるおそれが高まると、7月に小さなスーツケース2つだけを持って脱出しました
            <Ref n={4} />
            <Ref n={5} />。フェルミは1938年12月、ノーベル賞の授賞式のあと、ムッソリーニの独裁を逃れてそのままアメリカへ移りました
            <Ref n={2} />。
          </p>
          <FigExile />
          <p>
            シラードと、同じハンガリー出身のウィグナー、テラーは、ドイツが先に原子爆弾を作ることを恐れていました
            <Ref n={15} />。シラードたちはアインシュタインに相談し、ローズベルト大統領にあてた1939年8月2日付の手紙をまとめました。手紙は、大量のウランで連鎖反応を起こせる見込みが高まり、非常に強力な新しい型の爆弾が作られるかもしれないと伝えています
            <Ref n={16} />。文面を書いた人は資料によって違います。アメリカのエネルギー省の資料はアインシュタインがシラードの助けを借りて書いたとし
            <Ref n={15} />
            、原子力遺産財団の資料はシラードが書いた手紙にアインシュタインが署名したとしています
            <Ref n={12} />。
          </p>
          <p>
            手紙は10月11日に大統領に伝えられ、大統領はウランを調べる委員会を作りました。これが、マンハッタン計画につながる最初の決定になりました
            <Ref n={15} />。アインシュタインはこの手紙のほかには原子爆弾の開発に関わっていません
            <Ref n={14} />。
          </p>
        </>
      ),
    },
    {
      id: 'manhattan',
      title: 'マンハッタン計画と広島・長崎（1942〜1945年）',
      body: (
        <>
          <p>
            アメリカの原子爆弾の開発は1942年の秋にマンハッタン計画として本格的に始まりました。理論物理学者の<Who id="oppenheimer">ロバート・オッペンハイマー</Who>は、1943年から1945年までロスアラモス研究所の所長として開発を率いました
            <Ref n={17} />。各地には、ウラン235を分けて集める工場や、原子炉でプルトニウムという新しい元素を作る施設が建てられました
            <Ref n={9} />
            <Ref n={10} />。フェルミとフリッシュも開発に加わりました
            <Ref n={2} />
            <Ref n={13} />。一方、マイトナーは参加の誘いを断り、1946年に「私はすべての爆弾を憎む」と語っています
            <Ref n={5} />。
          </p>
          <FigRoad28 />
          <p>
            1945年7月16日、ニューメキシコ州で最初の核爆発の実験（トリニティ実験）が行われました
            <Ref n={17} />。アメリカ軍は8月6日午前8時15分に広島へ
            <Ref n={18} />
            、8月9日午前11時2分に長崎へ原子爆弾を投下しました（<FigRef n="28-9" />）
            <Ref n={20} />。
          </p>
          <p>
            亡くなった人の数は、被爆直前の人口が分かる資料が焼けたことなどから、今も正確には分かっていません。広島市は1945年12月末までに約14万人（前後1万人の誤差）が亡くなったと推計しています
            <Ref n={19} />。長崎市は1950年の報告による1945年12月末までの推定として、死者7万3884人、重軽傷者7万4909人を挙げています
            <Ref n={20} />。アメリカのエネルギー省の資料は、広島の1945年末までの死者を10万人を超える程度と見積もっています。生き残った人の中にも、数日後から放射線による病気で亡くなる人が増え、がんなどの病気にかかる危険はその後も一生続きました
            <Ref n={18} />。8月15日、日本の降伏を伝える天皇の放送がラジオで流れました
            <Ref n={21} />。
          </p>
        </>
      ),
    },
    {
      id: 'after',
      title: '戦後の科学者の議論と、その後の研究',
      body: (
        <>
          <p>
            原子爆弾が使われる前から、開発に関わった科学者の意見は分かれていました。1945年6月、物理学者フランクを長とする委員会は、日本の都市に使う前に人のいない場所で威力を示すべきだと報告しましたが、採用されませんでした。7月にはシラードが、投下しないよう大統領に求める請願書を回しましたが、大統領には届きませんでした
            <Ref n={12} />。
          </p>
          <p>
            戦後、オッペンハイマーは核兵器の国際的な管理を求め、水素爆弾の開発に反対しました。1954年、原子力委員会は聴聞会を開き、オッペンハイマーの保安許可（国の機密に触れる資格）を取り消しました
            <Ref n={17} />。2022年12月16日、アメリカのエネルギー省は、この決定は委員会自身の規則に反する手続きで行われたとして、決定を取り消しました
            <Ref n={22} />。
          </p>
          <p>
            1955年7月9日、哲学者のラッセルとアインシュタインらは、核兵器を使う戦争は人類の存続をおびやかすと訴える宣言を発表しました。署名した11人には<Who id="born">マックス・ボルン</Who>と<Who id="yukawa">湯川秀樹</Who>もいます。宣言は「人間であることを思い出し、ほかのことは忘れてください」と呼びかけ、科学者が集まって話し合うことを求めました
            <Ref n={23} />。1957年7月、カナダのパグウォッシュ村で最初のパグウォッシュ会議が開かれ、湯川と<Who id="tomonaga">朝永振一郎</Who>らが出席しました
            <Ref n={24} />。
          </p>
          <FigBinding />
          <p>
            物理の面では、核分裂でエネルギーが出る理由を<FigRef n="28-10" />で説明できます。原子核の粒子1個あたりの結びつきは鉄のあたりで最も強く、重い原子核は割れると、軽い原子核はくっつくと、より強く結びついた原子核になります。その差の分の質量がエネルギーとして出ます
            <Ref n={7} />。軽い原子核がくっつく核融合は<ChapterLink n="35" />で、陽子と中性子を結びつける力は<ChapterLink n="30" />で扱います。原子炉は戦後、発電にも使われるようになりました
            <Ref n={8} />。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章の要点',
      body: (
        <ul>
          <li>1934年、フェルミは電気を持たない中性子を原子核に当て、遅い中性子ほど取り込まれやすいことを見つけた。ウランからは、ウランより重い元素ができたと考えられた。</li>
          <li>1938年12月、ハーンとシュトラスマンはウランからバリウムができたことを見つけ、マイトナーとフリッシュはそれを原子核が2つに割れる核分裂だと解釈した。</li>
          <li>破片はもとの原子核より陽子の約5分の1だけ軽い。減った質量が、破片が飛び離れる運動のエネルギーになる。</li>
          <li>次の核分裂を起こす中性子が平均1個より多いと連鎖反応は広がり、ちょうど1個なら臨界になる。1942年12月2日、最初の原子炉が動いた。</li>
          <li>亡命した物理学者たちの働きかけで、1939年にアメリカ政府はウランを調べる委員会を作った。1945年8月6日に広島、9日に長崎に原子爆弾が投下され、1945年末までの死者は広島で約14万人、長崎で約7万4000人と推計されている。</li>
          <li>戦後、ラッセル＝アインシュタイン宣言やパグウォッシュ会議など、科学者が核兵器の危険を訴える活動が続いた。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Artificial radioactivity produced by neutron bombardment（Nobel Lecture）', publisher: 'NobelPrize.org（Enrico Fermi）', url: 'https://www.nobelprize.org/uploads/2018/06/fermi-lecture.pdf', accessed: '2026-11-18', version: '1938年12月12日の講演', note: 'パラフィンや水で囲むと放射化が最大100倍になったこと、中性子と陽子の質量がほぼ等しく約20回の衝突で熱運動の速さまで遅くなること、93番・94番の元素の命名、印刷時にハーンとシュトラスマンの発見を受けて見直しが必要だとする注を加えたこと。' },
    { title: 'Enrico Fermi – Biographical', publisher: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/1938/fermi/biographical/', accessed: '2026-11-18', note: '1934年の中性子照射と遅い中性子の発見、受賞直後にファシスト独裁を逃れてアメリカへ移ったこと、核分裂の発見後すぐに中性子の放出と連鎖反応の可能性に気づいたこと、1942年12月2日のシカゴでの連鎖反応、原子爆弾の開発での役割。' },
    { title: 'Atomic Bombardment, 1932-1938（The Manhattan Project: An Interactive History）', publisher: 'アメリカ・エネルギー省（OSTI）', url: 'https://www.osti.gov/opennet/manhattan-project-history/Events/1890s-1939/atomic_bombardment.htm', accessed: '2026-11-18', note: '陽子とα粒子は正の電気のため原子核に押し返され、当たるのは100万回に1回ほどだったこと、電気を持たない中性子を使ったフェルミの実験、63元素から37の新しい放射性元素、遅い中性子が原子核の近くに長くとどまり取り込まれやすいこと、生成物をめぐる意見の違い。' },
    { title: 'December 1938: Discovery of Nuclear Fission（This Month in Physics History）', publisher: 'APS News（アメリカ物理学会）', url: 'https://www.aps.org/apsnews/2007/12/december-1938-discovery-nuclear-fission', accessed: '2026-11-18', version: '2007年12月', note: 'ノダックの指摘、ハーン・シュトラスマン・マイトナーの役割分担、1938年7月の脱出とスーツケース2つ、クリスマスの雪の中の議論、液滴の模型（ガモフ、ボーア）、約200MeVと陽子の約5分の1の質量の差、fission の命名、ボーアがアメリカへ伝えたこと、1944年の化学賞がハーンに贈られたこと。' },
    { title: 'A fateful year for a physicist（Flashback: Nuclear Fission）', publisher: 'MaxPlanckResearch（マックス・プランク協会）', url: 'https://www.mpg.de/12252607/S004_Flashback_080-081.pdf', accessed: '2026-11-18', version: '2018年第3号', note: '1938年7月の脱出とオーストリア併合後の危険、1938年12月19日のハーンの手紙の文面、1939年1月6日の Die Naturwissenschaften での発表、2月の Nature の論文、1946年に「すべての爆弾を憎む」と語ったこと、開発への誘いを断ったこと。' },
    { title: 'Disintegration of Uranium by Neutrons: a New Type of Nuclear Reaction', publisher: 'Nature 143, 239–240（L. Meitner, O. R. Frisch）', url: 'https://www.nature.com/articles/143239a0', accessed: '2026-11-18', version: '1939年2月11日発行', note: 'マイトナーとフリッシュの論文。発行日は出版社のページと Crossref で確認。' },
    { title: '原子炉の物理 第5章 核分裂と連鎖反応、発生エネルギー、崩壊熱', publisher: '日本原子力研究開発機構', url: 'https://rpg.jaea.go.jp/else/rpd/others/study/text_data/text_each/chap5_20191224.pdf', accessed: '2026-11-18', note: '1回の核分裂で平均2〜3個の中性子が出ること、連鎖反応と世代の考え方、約200MeVのエネルギーの大部分が破片の運動エネルギーになること、核子あたりの結合エネルギーが質量数50〜60の鉄のあたりで最も大きく、核分裂と核融合でエネルギーが出ること。' },
    { title: 'Physics of Uranium and Nuclear Energy', publisher: 'World Nuclear Association', url: 'https://world-nuclear.org/information-library/nuclear-fuel-cycle/introduction/physics-of-nuclear-energy', accessed: '2026-11-18', note: '1回の核分裂で約200MeV、炭素1原子の燃焼で約4eV（比は約5000万倍）、中性子は2〜3個（平均2.45）、臨界では生まれる中性子が次の核分裂・吸収・外への漏れと釣り合うこと、遅い中性子ほど取り込まれる確率が大きいこと、原子炉による発電。' },
    { title: 'Fission Comes to America, 1939（The Manhattan Project: An Interactive History）', publisher: 'アメリカ・エネルギー省（OSTI）', url: 'https://www.osti.gov/opennet/manhattan-project-history/Events/1890s-1939/fission_america.htm', accessed: '2026-11-18', note: 'ボーアの1939年1月16日の到着と1月26日の会議、核分裂で中性子が出ること、ウラン235が天然ウランの140分の1で遅い中性子で割れると1940年3月までに確かめられたこと、ウラン235を分ける必要、研究結果の発表を控える呼びかけ。' },
    { title: 'CP-1 Goes Critical, December 2, 1942（The Manhattan Project: An Interactive History）', publisher: 'アメリカ・エネルギー省（OSTI）', url: 'https://www.osti.gov/opennet/manhattan-project-history/Events/1942-1944_pu/cp-1_critical.htm', accessed: '2026-11-18', note: 'スタッグ・フィールドの観客席の下のスカッシュのコート、黒鉛の減速材とカドミウムの制御棒、午後3時25分に連鎖反応が自ら続く状態になったこと、約0.5ワット、28分の運転、増倍率1.0006、シラードの言葉、プルトニウムを作る原子炉の計画。' },
    { title: 'Law for the Restoration of the Professional Civil Service', publisher: 'United States Holocaust Memorial Museum（Holocaust Encyclopedia）', url: 'https://encyclopedia.ushmm.org/content/en/article/law-for-the-restoration-of-the-professional-civil-service', accessed: '2026-11-18', note: '1933年1月にナチスが政権を握り、4月7日の法律でユダヤ系の人と政治的な反対者を公務員の職から追放したこと。州立大学の職員も対象だったこと。' },
    { title: 'Leo Szilard', publisher: 'Atomic Heritage Foundation（National Museum of Nuclear Science & History）', url: 'https://ahf.nuclearmuseum.org/ahf/profile/leo-szilard/', accessed: '2026-11-18', note: '1933年のイギリスへの移住と連鎖反応の考え、1938年のアメリカ、シラードが書いた手紙にアインシュタインが署名したこと、1945年6月のフランク報告とその勧めが採用されなかったこと、7月の請願書（最終版は68人が署名）が大統領に届かなかったこと。' },
    { title: 'Short biography and Publications by Otto Robert Frisch', publisher: 'ハンブルク大学 化学科', url: 'https://www.chemie.uni-hamburg.de/en/institute/pc/publikationen/db/frisch.html', accessed: '2026-11-18', note: '1933年7月31日の解雇、1933〜1934年のロンドン、1934〜1939年のコペンハーゲン、1939〜1940年のバーミンガム、1940〜1943年のリバプール、1943〜1946年のロスアラモスでの開発への参加。' },
    { title: 'Albert Einstein in Brief / The Nuclear Age', publisher: 'American Institute of Physics（Center for History of Physics）', url: 'https://history.aip.org/exhibits/einstein/inbrief.htm', accessed: '2026-11-18', note: '1933年にナチス政権のドイツに住むことを拒んでプリンストン高等研究所に移ったこと、1939年の手紙への署名。手紙のほかに原爆の開発に関わらなかったことは同じ展示の nuclear1.htm で確認。' },
    { title: "Einstein's Letter, 1939（The Manhattan Project: An Interactive History）", publisher: 'アメリカ・エネルギー省（OSTI）', url: 'https://www.osti.gov/opennet/manhattan-project-history/Events/1939-1942/einstein_letter.htm', accessed: '2026-11-18', note: 'アインシュタインがシラードの助けを借りて手紙を書いたこと、ウィグナーとテラーの危機感、1939年10月11日にザックスが大統領に伝えたこと、10月19日の返事と委員会、マンハッタン計画につながる最初の決定だったこと。' },
    { title: 'Einstein-Szilard Letter', publisher: 'Atomic Heritage Foundation（National Museum of Nuclear Science & History）', url: 'https://ahf.nuclearmuseum.org/ahf/key-documents/einstein-szilard-letter/', accessed: '2026-11-18', note: '1939年8月2日付の手紙の本文（連鎖反応の見込み、新しい型の爆弾の可能性、チェコスロバキアのウランの販売停止）。' },
    { title: 'J. Robert Oppenheimer', publisher: 'Atomic Heritage Foundation（National Museum of Nuclear Science & History）', url: 'https://ahf.nuclearmuseum.org/ahf/profile/j-robert-oppenheimer/', accessed: '2026-11-18', note: '1942年秋の計画の開始、1942年10月15日のグローヴズの依頼、1943〜1945年の所長職、1945年7月16日のトリニティ実験、戦後の国際的な管理の主張と水爆への反対、1954年の保安許可の取り消し、1963年のフェルミ賞。' },
    { title: 'The Atomic Bombing of Hiroshima, August 6, 1945（The Manhattan Project: An Interactive History）', publisher: 'アメリカ・エネルギー省（OSTI）', url: 'https://www.osti.gov/opennet/manhattan-project-history/Events/1945/hiroshima.htm', accessed: '2026-11-18', note: '午前8時15分の投下、熱・爆風・放射線の被害、数日後から現れた放射線による病気、1945年末までの死者は10万人を超えたとみられるという見積もり、がんなど長期の影響。' },
    { title: '原爆で何人が亡くなった（被爆した）のですか。', publisher: '広島市', url: 'https://www.city.hiroshima.lg.jp/faq/hibakushaengo/1001593/1002276.html', accessed: '2026-11-18', version: '2025年3月4日更新', note: '1945年12月末までに約14万人（±1万人）が亡くなったという推計、正確な数が分からない理由（被爆直前の人口の資料の焼失、疎開による人口の流動、軍関係者の情報が不明）。' },
    { title: '原爆被爆者対策事業概要（令和7年版） 第2 原子爆弾の投下と被害状況', publisher: '長崎市', url: 'https://www.city.nagasaki.lg.jp/uploaded/attachment/47023.pdf', accessed: '2026-11-18', version: '2025年7月発行', note: '1945年8月9日午前11時2分の投下、1950年7月の原爆資料保存委員会の報告による1945年12月末までの推定（死者7万3884人、重軽傷者7万4909人）。' },
    { title: 'Japan Surrenders, August 10-15, 1945（The Manhattan Project: An Interactive History）', publisher: 'アメリカ・エネルギー省（OSTI）', url: 'https://www.osti.gov/opennet/manhattan-project-history/Events/1945/surrender.htm', accessed: '2026-11-18', note: '1945年8月15日に降伏を伝える天皇の放送がラジオで流れたこと。' },
    { title: 'Secretary Granholm Statement on DOE Order Vacating 1954 Atomic Energy Commission Decision In the Matter of J. Robert Oppenheimer', publisher: 'アメリカ・エネルギー省', url: 'https://www.energy.gov/articles/secretary-granholm-statement-doe-order-vacating-1954-atomic-energy-commission-decision', accessed: '2026-11-18', version: '2022年12月16日', note: '1954年の原子力委員会の決定を、委員会自身の規則に反する欠陥のある手続きで行われたとして取り消したこと。' },
    { title: 'Statement: The Russell-Einstein Manifesto', publisher: 'Pugwash Conferences on Science and World Affairs', url: 'https://pugwash.org/1955/07/09/statement-manifesto/', accessed: '2026-11-18', version: '1955年7月9日', note: '宣言の本文（科学者の会議の呼びかけ、"Remember your humanity, and forget the rest."、各国政府に平和的な解決を求める決議）と11人の署名者（ボルン、アインシュタイン、湯川など）。' },
    { title: '日本パグウォッシュ会議の沿革', publisher: '日本パグウォッシュ会議', url: 'https://www.pugwashjapan.jp/overview', accessed: '2026-11-18', note: '1955年7月の宣言に湯川秀樹が加わったこと、1957年7月にカナダのパグウォッシュ村で開かれた第1回会議に湯川秀樹、朝永振一郎、小川岩雄が出席したこと。' },
  ],
}

export default chapter
