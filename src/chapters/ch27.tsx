import type { Chapter } from '../content/types'
import { ChapterLink, FigRef, Ref, Term } from '../components/content'
import { Who } from '../components/history'
import { FigBecquerel, FigChain, FigCurie, FigFoil, FigHalfLife, FigMagnet, FigNitrogen, FigNucleus, FigPenetrate, FigRoad } from '../figures/ch27'

const chapter: Chapter = {
  key: '27',
  part: 'p6',
  title: '放射線と原子核',
  summary: '1896年、ベクレルはウランが見えない放射線を出し続けていることを見つけました。キュリー夫妻とラザフォードの研究から、放射線を出す原子は別の元素の原子に変わること、原子核は陽子と中性子でできていることが分かりました。',
  goals: [
    'ベクレルが放射線を見つけた経緯と、それが当時の物理学で説明できなかった理由を説明できる',
    'キュリー夫妻が放射線の強さを測ってポロニウムとラジウムを見つけた方法を説明できる',
    'α線・β線・γ線の違いを、電気の有無と物を通り抜ける力の違いで説明できる',
    '原子核が崩壊して別の元素に変わることと、半減期の意味を説明できる',
    '陽子と中性子が見つかった経緯と、同位体とは何かを説明できる',
  ],
  prerequisites: ['10', '12', '18', '22'],
  people: ['curie', 'rutherford'],
  events: [
    { year: 1896, title: 'ベクレルの放射線', note: 'ベクレルが、日光に当てなくてもウランの塩が写真の乾板を感光させることを見つけ、3月2日に報告した。', section: 'becquerel' },
    { year: 1898, title: 'ポロニウムとラジウム', note: 'キュリー夫妻が、放射線の強さを測りながらウランの鉱石を分け、7月にポロニウム、12月にラジウムを発表した。', people: ['curie'], section: 'curie' },
    { year: 1902, title: '元素が変わる', note: 'ラザフォードとソディが、放射線を出す元素は自然に別の元素へ変わり続けていると結論した。', people: ['rutherford'], section: 'transmutation' },
    { year: 1932, title: '中性子の発見', note: 'チャドウィックが、ベリリウムから出る通り抜けやすい放射線は、陽子とほぼ同じ重さで電気を持たない粒（中性子）だと示した。', section: 'nucleus' },
  ],
  sections: [
    {
      id: 'becquerel',
      title: 'ウランから出る見えない光線（1896年）',
      body: (
        <>
          <p>
            第6部（第27〜32章）では原子核と、物をつくるさらに小さな粒の研究をたどります。この章で扱うのは、ウランから出る見えない光線の発見から、原子核が2種類の粒でできていると分かるまでです。第28章では核分裂と原子爆弾、第29章では反物質と場の量子論、第30章では中間子とクォーク、第31章では対称性と力の統一、第32章ではヒッグス粒子とニュートリノを扱います。この章の出来事は<FigRef n="27-1" />のとおりです。
          </p>
          <FigRoad />
          <p>
            1895年の終わりに、黒い紙も通り抜けるX線が見つかりました（<ChapterLink n="10" />
            ）。パリのアンリ・ベクレルは、日光を当てると光るウランの塩が、日光を吸い込んでX線に似た光線を出しているのではないかと考えました
            <Ref n={1} />。
          </p>
          <p>
            ベクレルは写真の乾板を厚い黒い紙で包み、その上にウランの塩の結晶を置いて、数時間日光に当てました。現像すると、結晶の形が黒く写っていました。1896年2月24日、ベクレルはこの結果をパリの科学アカデミーで報告しました
            <Ref n={2} />。
          </p>
          <p>
            次の実験は2月26日と27日に準備しましたが、日がときどきしか差さなかったため、ベクレルは道具を組んだまま引き出しにしまいました。その後も晴れなかったので、3月1日に、像は弱いだろうと思いながら現像すると、結晶の形がはっきりと写っていました。翌日の報告でベクレル自身がこの経緯を書いています
            <Ref n={2} />。<FigRef n="27-2" />
            はこの2つの実験の模式図で、結晶と乾板の間に置いた薄い銅の十字の形も写っています
            <Ref n={3} />。
          </p>
          <FigBecquerel />
          <p>
            ベクレルはさらに、光線を出しているのはウランという元素そのものだと、1896年5月に発表しました
            <Ref n={1} />。このような光線や粒の流れを、現在は
            <Term def="物を通り抜け、当たった物の原子から電子をはじき出す力を持つ、速い粒の流れや波長のとても短い電磁波。原子核が崩れるときに出るα線・β線・γ線や、X線などがある。" en="radiation">放射線</Term>
            と呼びます。
          </p>
          <p>
            ウランは光も熱も電気も受け取らないのに、放射線を出し続けます。そのエネルギーがどこから来るのかを、当時の物理学では説明できませんでした。原子はそれ以上分けられない粒だと考えられていたからです（<ChapterLink n="22" />
            ）。1898年にマリー・キュリーは、重い元素だけが吸い込む見えない光線が空間を絶えず飛び交っているのかもしれない、という考えも書いています
            <Ref n={4} />。
          </p>
        </>
      ),
    },
    {
      id: 'curie',
      title: 'キュリー夫妻とラジウム（1898年）',
      body: (
        <>
          <p>
            ポーランド生まれで、パリで研究していた<Who id="curie">マリー・キュリー</Who>
            は、1898年にベクレルの放射線を調べ始めました
            <Ref n={1} />。キュリーは写真の乾板の代わりに、放射線が当たった空気が電気を通すようになる性質を使いました。2枚の金属の板の一方に調べる物の粉を広げ、板の間に電圧をかけて、流れるとても弱い電流を測ります。電流が大きいほど、放射線が強いことになります
            <Ref n={4} />。
          </p>
          <p>
            測ってみると、ウランの化合物はウランを多く含むものほど強い放射線を出し、トリウムの化合物も放射線を出しました。キュリーは、放射線を出すのは原子そのものの性質だと考えました
            <Ref n={4} />
            。この性質を
            <Term def="原子核が自然に崩れて、放射線を出す性質。放射線を出す強さを指すこともある。" en="radioactivity">放射能</Term>
            と名づけたのもキュリーです
            <Ref n={1} />。
          </p>
          <p>
            <FigRef n="27-3" />
            は、キュリーが1898年の論文に載せた測定の一部です。ウランの鉱石であるピッチブレンドは、金属のウランよりも大きな電流を流しました。一方、天然の燐銅ウラン鉱と同じ成分を薬品から作ると、電流は天然のものの6分の1ほどでした。キュリーは、天然の鉱石にはウランよりずっと強い放射線を出す未知の元素が少し含まれていると考えました
            <Ref n={4} />。
          </p>
          <FigCurie />
          <p>
            夫で物理学者のピエール・キュリーも加わり、2人はピッチブレンドを成分ごとに分けては、それぞれの放射線の強さを測ることを繰り返しました。1898年7月には、ビスマスと一緒に分かれる部分から新しい元素ポロニウム（マリーの生まれた国にちなむ名前）を、12月には、バリウムと一緒に分かれる部分からラジウムを発表しました
            <Ref n={5} />。
          </p>
          <p>
            2人はオーストリア政府から贈られた1トンのピッチブレンドなどを処理し、マリーは3年以上かけて0.1グラムの純粋な塩化ラジウムを取り出しました
            <Ref n={5} />。1903年、ベクレルとキュリー夫妻はノーベル物理学賞を受けました
            <Ref n={1} />。ラジウムは熱も出し続けることが分かり、そのエネルギーの出どころはさらに大きな問題になりました（<ChapterLink n="18" />
            ）。
          </p>
        </>
      ),
    },
    {
      id: 'rays',
      title: 'α線・β線・γ線',
      body: (
        <>
          <p>
            <Who id="rutherford">アーネスト・ラザフォード</Who>
            は、ウランの酸化物と測定器の間に厚さ200分の1mmのアルミニウム箔を1枚ずつ重ねて、放射線の強さを測りました。<FigRef n="27-4" />
            のように、強さは最初の数枚で急に弱まり、その後はほとんど変わりませんでした
            <Ref n={6} />。
          </p>
          <FigFoil />
          <p>
            ラザフォードは1899年1月の論文で、ウランの放射線には少なくとも2種類あるとし、吸収されやすいほうをα線、通り抜けやすいほうをβ線と「便宜上」呼びました
            <Ref n={6} />。その後、磁石の極の間を通す実験で、β線は陰極線（電子の流れ。<ChapterLink n="22" />
            ）と同じ向きに大きく曲がり、α線はとても強い磁石でようやく逆向きにわずかに曲がることが分かりました
            <Ref n={3} />
            。1900年にはフランスのヴィラールが、磁石で曲がらない3つ目の放射線を見つけ、これはのちにγ線と名づけられました
            <Ref n={7} />。
          </p>
          <FigMagnet />
          <p>
            <FigRef n="27-5" />
            は3つの放射線の曲がり方の違いを表しています。
            <Term def="放射線の一種で、正の電気を持つα粒子（ヘリウムの原子核）の流れ。物を通り抜ける力が弱く、紙1枚で止まる。" en="alpha rays">α線</Term>
            は正の電気を持つ重い粒（α粒子）の流れです。1908年にラザフォードとロイズは、集めたα粒子からヘリウムの光の線（スペクトル）が現れることを示し、α粒子がヘリウムであることを確かめました
            <Ref n={8} />
            。現在の言葉では、α粒子はヘリウムの原子核です。
            <Term def="放射線の一種で、原子核から飛び出した速い電子の流れ。負の電気を持ち、紙は通り抜けるが、厚さ数mmのアルミニウムの板で止まる。" en="beta rays">β線</Term>
            は負の電気を持つ速い電子の流れ、
            <Term def="放射線の一種で、原子核から出る、X線よりもさらに波長の短い電磁波。電気を持たないので磁石で曲がらず、物を通り抜ける力が強い。" en="gamma rays">γ線</Term>
            はX線よりさらに波長の短い電磁波で、γ線の正体は1914年に分かりました
            <Ref n={7} />。
          </p>
          <p>
            3つの放射線は物を通り抜ける力も違います。<FigRef n="27-6" />
            のように、α線は紙1枚で止まり、β線は厚さ2〜4mmほどのアルミニウムの板で止まります。γ線は鉛や鉄の厚い板で弱めることができます
            <Ref n={9} />。
          </p>
          <FigPenetrate />
        </>
      ),
    },
    {
      id: 'transmutation',
      title: '元素が別の元素に変わる：崩壊と半減期',
      body: (
        <>
          <p>
            カナダのマギル大学に移ったラザフォードは、トリウムの化合物から放射能を持つ何かが絶えず出てくることに気づき、エマネーション（放出物）と呼びました。1900年1月の論文で、この放出物の放射能は約1分で半分になり、そのあとも同じ割合で減っていくことを示しました
            <Ref n={10} />。放射能が半分になるまでの時間を
            <Term def="放射性の原子核の数が、崩壊して半分に減るまでの時間。原子核の種類ごとに決まっていて、温度や圧力では変わらない。" en="half-life">半減期</Term>
            といいます。
          </p>
          <p>
            ラザフォードは化学者のソディと組み、トリウムの化合物から、化学的な性質がトリウムと違う物（トリウムX）を取り出しました。トリウムXの放射能は約4日で半分になり、残ったトリウムからは新しいトリウムXが生まれ続けました。1902年、2人は、放射能は原子の中で起きる変化で、放射性の元素は自然に別の物へ変わり続けていると結論しました
            <Ref n={11} />
            。現在は、原子核が放射線を出して別の原子核に変わることを崩壊といいます。
          </p>
          <p>
            元素の種類は周期表の順番の番号である
            <Term def="周期表で元素を並べた順番の番号。原子核が持つ正の電気の量（陽子の数）に等しく、元素の種類を決める。" en="atomic number">原子番号</Term>
            で表せます。原子核がα線を出すと原子番号が2小さい元素に、β線を出すと1大きい元素に変わります
            <Ref n={12} />。<FigRef n="27-7" />
            は、ウラン238が崩壊を繰り返して鉛206になるまでの主な道筋です。ウラン238はα線を8回、β線を6回出して、崩壊しない鉛206になります。途中の原子核の半減期は1万分の1.6秒のものから約45億年のものまでさまざまです
            <Ref n={13} />。
          </p>
          <FigChain />
          <p>
            一つ一つの原子核がいつ崩壊するかは決まっておらず、予測できません。それでも、同じ種類の原子核がたくさん集まると、半減期がたつごとに数がほぼ半分になります
            <Ref n={14} />。<FigRef n="27-8" />
            の左では、原子核がばらばらの時刻に崩壊していきます。「原子核の数」を16個にすると、残る数は半分からかなりずれますが、400個にすると、右のグラフの線は半分ずつ減る点線にほぼ重なります。
          </p>
          <FigHalfLife />
        </>
      ),
    },
    {
      id: 'nucleus',
      title: '陽子と中性子、同位体（1913〜1932年）',
      body: (
        <>
          <p>
            崩壊の研究から、化学的には区別できないのに、重さや放射能が違う物がいくつも見つかりました。1913年、ソディは、こうした物は周期表の同じ場所に入る同じ元素だと考え、
            <Term def="原子番号が同じで、原子核の重さが違う原子。原子核の陽子の数は同じで、中性子の数が違う。化学的な性質はほぼ同じ。" en="isotope">同位体</Term>
            （アイソトープ）と名づけました
            <Ref n={15} />。
          </p>
          <p>
            1919年、ラザフォードは窒素の気体にα粒子を当てると、α粒子が届く距離より遠くまで飛ぶ粒が出てくることを確かめ、窒素の原子核から水素の原子核が飛び出したと考えました。ただし、このときラザフォードが主張したのはここまでで、窒素が別の元素に変わったとは書いていません
            <Ref n={16} />。水素の原子核はのちに
            <Term def="原子核をつくる粒の一つで、正の電気を持つ。水素の原子核は陽子1個だけでできている。原子核の陽子の数が原子番号になる。" en="proton">陽子</Term>
            と呼ばれるようになりました。
          </p>
          <p>
            窒素の原子核で起きたことを写真でとらえたのは、ラザフォードの研究室のブラケットです。ブラケットは、粒が通った跡に霧の筋ができる装置（霧箱）で2万3000枚の写真を撮り、40万本以上のα粒子の跡から、枝分かれした跡を8本見つけました。どれも、α粒子の跡はそこで終わり、出ていく跡は細く長い陽子の跡と太く短い跡の2本だけでした。α粒子は窒素の原子核に取り込まれ、窒素は陽子を出して酸素に変わったのです
            <Ref n={17} />。写真は1924年に撮られ、1925年に発表されました
            <Ref n={16} />。<FigRef n="27-9" />
            は1919年と1925年に分かったことの違いを表しています。
          </p>
          <FigNitrogen />
          <p>
            ヘリウムの原子核の電気は陽子2個分なのに、重さは陽子の約4個分あります
            <Ref n={12} />。ラザフォードは1920年の講演で、重さが陽子と同じくらいで電気を持たない粒があるかもしれないと述べました
            <Ref n={16} />。1930年、ドイツのボーテとベッカーは、ベリリウムにα粒子を当てると通り抜けやすい放射線が出ることを見つけました。1932年の初めには、フランスのジョリオ＝キュリー夫妻（妻のイレーヌはマリーの娘）が、この放射線が陽子をはじき出すことを示し、γ線だと考えました。チャドウィックは、はじき出される原子核の動きを詳しく測ってγ線では説明できないことを示し、1932年2月、この放射線は陽子とほぼ同じ重さで電気を持たない粒の流れだと発表しました
            <Ref n={18} />
            <Ref n={16} />。この粒が
            <Term def="原子核をつくる粒の一つで、電気を持たない。重さは陽子とほぼ同じ。同じ元素でも中性子の数が違うと同位体になる。" en="neutron">中性子</Term>
            です。
          </p>
          <p>
            現在では、原子核は陽子と中性子でできていることが分かっています。陽子の数が原子番号で、ウラン238や炭素14の数は陽子と中性子の数の合計です。同位体は、陽子の数が同じで中性子の数が違う原子核です。β線は、原子核の中で中性子が陽子に変わるときに出る電子です
            <Ref n={12} />。<FigRef n="27-10" />
            の「原子核」を切り替えると、陽子と中性子の数を比べられます。
          </p>
          <FigNucleus />
        </>
      ),
    },
    {
      id: 'after',
      title: 'その後の展開',
      body: (
        <>
          <p>
            中性子は電気を持たないので、正の電気を持つ原子核に押し返されずに近づけます。中性子を原子核に当てる実験は、ウランの原子核が2つに割れる核分裂の発見につながりました（<ChapterLink n="28" />
            ）。新しい問いも生まれました。正の電気を持つ陽子どうしは押し合うのに原子核がばらばらにならないのはなぜか（<ChapterLink n="30" />
            ）、β線を出す崩壊でエネルギーの一部が消えたように見えるのはなぜか（<ChapterLink n="12" />
            、<ChapterLink n="32" />）という問いです。
          </p>
          <p>
            半減期は年代を測る方法にもなりました。大気の中では、宇宙線（宇宙から降り注ぐ粒。<ChapterLink n="18" />
            ）のはたらきで炭素14ができています。生き物が死ぬと炭素14を取り込まなくなり、体に残った炭素14は約5700年の半減期で減っていきます。1949年にアメリカのリビーはこの性質を使って化石や遺物の年代を測る方法を作り、1960年にノーベル化学賞を受けました
            <Ref n={19} />
            <Ref n={13} />。
          </p>
          <p>
            放射線は体を傷つけることもあります。1920年代には、少しの放射線は体によいと信じる人も多く、ラジウムを入れた化粧品なども売られていました。マリー・キュリーは1934年7月4日、骨髄がはたらかなくなる血液の病気で亡くなりました。療養所の所長は、長年浴びた放射線で骨髄が傷ついたためだろうと報告しています
            <Ref n={20} />
            。1925年には、キュリーも加わったフランスの委員会が、放射性物質を扱う工場で鉛の板で身を守り、働く人の血液を定期的に調べるよう勧めました
            <Ref n={20} />。放射線から身を守るための国際的な勧告は1928年に初めて出され、勧告を出した委員会は1950年に国際放射線防護委員会（ICRP）として組み直されました
            <Ref n={21} />。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章の要点',
      body: (
        <ul>
          <li>1896年、ベクレルは、日光に当てなくてもウランの塩が写真の乾板を感光させることを、曇りの日に引き出しにしまった乾板から見つけた。</li>
          <li>マリー・キュリーは、放射線を出すのは原子そのものの性質だと考えて放射能と名づけ、1898年にピエールとともにポロニウムとラジウムを見つけた。</li>
          <li>α線は正の電気を持つヘリウムの原子核、β線は負の電気を持つ電子、γ線は電気を持たない電磁波で、α線は紙で、β線はアルミニウムの板で止まる。</li>
          <li>1902年、ラザフォードとソディは、放射性の元素は自然に別の元素へ変わると結論した。一つ一つの原子核がいつ崩壊するかは予測できないが、全体の数は半減期ごとに半分になる。</li>
          <li>1919年にラザフォードは窒素から陽子が飛び出すことを示し、1925年にブラケットが窒素が酸素に変わる様子を写真で示した。1932年にチャドウィックが中性子を見つけた。</li>
          <li>原子核は陽子と中性子でできている。陽子の数が原子番号を決め、陽子の数が同じで中性子の数が違うものを同位体という。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'March 1, 1896: Henri Becquerel Discovers Radioactivity（This Month in Physics History）', publisher: 'American Physical Society（APS News、E. Tretkoff）', url: 'https://www.aps.org/apsnews/2008/02/becquerel-discovers-radioactivity', accessed: '2026-11-18', version: '2008年', note: 'ベクレルがりん光を出すウランの塩が日光からX線に似た光線を出すと考えたこと、1896年5月にウランという元素そのものが放射線を出すと発表したこと、マリー・キュリーが「放射能」という語を作ったこと、1903年にベクレルとキュリー夫妻がノーベル物理学賞を受けたこと。' },
    { title: 'On the rays emitted by phosphorescence / On the invisible rays emitted by phosphorescent bodies', publisher: 'H. Becquerel、Comptes Rendus 122巻 420ページ・501ページ（英訳 C. Giunta、Le Moyne College「Classic Chemistry」）', url: 'https://web.lemoyne.edu/giunta/becquerel.html', accessed: '2026-11-18', version: '1896年2月24日・3月2日の報告', note: 'ベクレル本人の報告。2月24日に日光に当てた実験を報告したこと、2月26日と27日に準備した実験を日が差さないので引き出しの暗がりにしまい、3月1日に現像すると像が強く出たこと。' },
    { title: 'On radioactivity, a new property of matter（Nobel Lecture）', publisher: 'H. Becquerel、NobelPrize.org', url: 'https://www.nobelprize.org/uploads/2018/06/becquerel-lecture.pdf', accessed: '2026-11-18', version: '1903年12月11日', note: '最初の像で放射線が黒い紙と銅の十字を通り抜けたこと、β線が陰極線と同じように磁場で曲がること、ラザフォードがα線をとても強い磁場でβ線と逆向きにわずかに曲げたこと、ヴィラールが曲がらない放射線に気づいたこと。' },
    { title: 'Rays emitted by compounds of uranium and of thorium', publisher: 'M. Skłodowska Curie、Comptes Rendus 126巻 1101〜1103ページ（英訳 C. Giunta、Le Moyne College「Classic Chemistry」）', url: 'https://web.lemoyne.edu/giunta/curie98.html', accessed: '2026-11-18', version: '1898年', note: '放射線が通す空気の電流で強さを測る方法（板の直径8cm、間隔3cm、100ボルト）、図27-3の測定値、ウランを多く含むほど強いこと、トリウムも放射線を出すこと、ピッチブレンドがウランより強く未知の元素を含むと考えたこと、空間を飛び交う光線を重い元素が吸い込むという考え。' },
    { title: 'Marie Curie and the Science of Radioactivity: The Discovery of Polonium and Radium', publisher: 'American Institute of Physics（Center for History of Physics）', url: 'https://history.aip.org/exhibits/curie/resbr2.htm', accessed: '2026-11-18', note: 'ピエールが研究に加わったこと、化学的に分けて放射線の強さで追う方法、1898年7月のポロニウム（ビスマスの部分）と12月のラジウム（バリウムの部分）、オーストリア政府から1トンのピッチブレンドを贈られたこと、3年以上かけて0.1グラムの塩化ラジウムを取り出したこと。' },
    { title: 'Uranium Radiation and the Electrical Conduction Produced by It', publisher: 'E. Rutherford、Philosophical Magazine 第5シリーズ47巻 109〜163ページ（ChemTeam による書き起こし）', url: 'https://www.chemteam.info/Chem-History/Rutherford-Alpha&Beta.html', accessed: '2026-11-18', version: '1899年1月', note: '厚さ0.0005cmのアルミニウム箔を重ねた測定値（0枚182、1枚77、2枚33、3枚14.6、4枚9.4、12枚7）と、吸収されやすいα線と通り抜けやすいβ線を「便宜上」区別したこと。' },
    { title: 'Discovering the Electromagnetic Spectrum', publisher: 'NASA Goddard Space Flight Center（Imagine the Universe!）', url: 'https://imagine.gsfc.nasa.gov/science/toolbox/history_multiwavelength1.html', accessed: '2026-11-18', version: '2013年9月更新', note: '1900年にヴィラールがラジウムの放射線の中にγ線を見つけ、のちにラザフォードがγ線と名づけたこと、1914年に結晶ではね返ることからX線より波長の短い電磁波と分かったこと。' },
    { title: 'The Nature of the α Particle from Radioactive Substances', publisher: 'E. Rutherford、T. Royds、Philosophical Magazine 17巻 281〜286ページ（Le Moyne College「Classic Chemistry」による書き起こし）', url: 'https://web.lemoyne.edu/giunta/royds.html', accessed: '2026-11-18', version: '1909年（1908年11月13日付）', note: '薄いガラスの壁を通り抜けたα粒子を集めた所にヘリウムのスペクトルが現れ、α粒子は電気を失うとヘリウムの原子になると結論したこと。' },
    { title: '放射線による健康影響等に関する統一的な基礎資料（令和6年度版）上巻 第1章「放射線の透過力」', publisher: '環境省', url: 'https://www.env.go.jp/chemi/rhm/current/attach/202503mat1-01-20.pdf', accessed: '2026-11-18', version: '本文の改訂日 2016年3月31日', note: 'α線は紙1枚で止まり、β線はプラスチック1cm、アルミニウムの板2〜4mm程度で止まり、γ線は鉛や鉄の厚い板で止められること。アメリカ環境保護庁（EPA）の Radiation Basics にも同じ趣旨の説明がある。' },
    { title: 'A Radioactive Substance emitted from Thorium Compounds', publisher: 'E. Rutherford、Philosophical Magazine 第5シリーズ49巻 1〜14ページ（ChemTeam による書き起こし）', url: 'https://www.chemteam.info/Chem-History/Rutherford-half-life.html', accessed: '2026-11-18', version: '1900年1月', note: 'トリウムの化合物から出る放射性の気体（エマネーション）の放射能が、約1分で半分になり、同じ割合で減り続けること。' },
    { title: 'The Cause and Nature of Radioactivity, Part I', publisher: 'E. Rutherford、F. Soddy、Philosophical Magazine 4巻 370〜396ページ（Le Moyne College「Classic Chemistry」による書き起こし）', url: 'https://web.lemoyne.edu/giunta/ruthsod.html', accessed: '2026-11-18', version: '1902年', note: 'トリウムXを化学的に分けたこと、その放射能が約4日で半分になること、トリウムから一定の割合で生まれ続けること、放射性の元素は自然に変わり続けているという結論。' },
    { title: "Basic Nuclear Science Information（The ABC's of Nuclear Science）", publisher: 'Lawrence Berkeley National Laboratory（Nuclear Science Division）', url: 'https://www2.lbl.gov/abc/Basic.html', accessed: '2026-11-18', note: '原子核は陽子と中性子からなること、同位体は中性子の数が違うこと、α線を出すと原子番号が2減り、β線を出すと原子核の中の中性子が陽子に変わって原子番号が1増えること。' },
    { title: 'Live Chart of Nuclides', publisher: '国際原子力機関（IAEA）Nuclear Data Section', url: 'https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html', accessed: '2026-11-18', note: '半減期の値（ラドン220は55.6秒、ウラン238は44.68億年、炭素14は5700年、ポロニウム214は1万分の1.63秒など）と崩壊の種類。図27-7の値もこのデータを丸めた。フランス国立アンリ・ベクレル研究所（LNHB）の表でもほぼ同じ値（ラドン220は55.8秒）を確かめた。' },
    { title: '放射能（ATOMICA 08-01-01-03）', publisher: '日本原子力研究開発機構（原子力百科事典 ATOMICA）', url: 'https://atomica.jaea.go.jp/data/detail/dat_detail_08-01-01-03.html', accessed: '2026-11-18', version: '2005年4月更新', note: '原子核を一つずつ見ると崩壊するまでの時間は一定していないが、たくさん集まると崩壊の割合は核種ごとに決まっていること。' },
    { title: 'Intra-atomic Charge', publisher: 'F. Soddy、Nature 92巻 399〜400ページ', url: 'https://www.nature.com/articles/092399c0', accessed: '2026-11-18', version: '1913年12月', note: 'ソディが、周期表の同じ場所に入り性質が同じで重さが違う物を同位体（isotope）と名づけたこと（ページの解説による）。' },
    { title: "Rutherford's Nuclear World: Atop the Physics Wave", publisher: 'American Institute of Physics（Center for History of Physics）', url: 'https://history.aip.org/exhibits/rutherford/sections/atop-physics-wave.html', accessed: '2026-11-18', note: '1919年にラザフォードが主張したのは窒素から水素の原子核（陽子）が飛び出すことまでで、元素の変換を示したのは1925年のブラケットであること。アストンの同位体の研究（1922年ノーベル化学賞）、1920年の講演での電気を持たない粒の予想、ボーテとベッカー（1930年）、ジョリオ＝キュリー夫妻（1932年）、チャドウィックの実験。' },
    { title: 'Cloud chamber researches in nuclear physics and cosmic radiation（Nobel Lecture）', publisher: 'P. M. S. Blackett、NobelPrize.org', url: 'https://www.nobelprize.org/uploads/2018/06/blackett-lecture.pdf', accessed: '2026-11-18', version: '1948年12月13日', note: '1924年に2万3000枚の写真を撮り40万本以上の跡を調べたこと、枝分かれした8本の跡はどれも出ていく跡が2本だけで、α粒子が取り込まれて酸素の重い同位体ができたと分かったこと。論文の発表は1925年（Proceedings of the Royal Society A 107巻）。' },
    { title: 'Possible Existence of a Neutron', publisher: 'J. Chadwick、Nature 129巻 312ページ', url: 'https://www.nature.com/articles/129312a0', accessed: '2026-11-18', version: '1932年2月27日', note: 'ボーテらのベリリウムの放射線とジョリオ＝キュリー夫妻の結果、γ線では説明が難しいこと、質量1で電気0の粒（中性子）と考えると説明できること。本文は ChemTeam の書き起こしで確認した。' },
    { title: 'Willard F. Libby – Facts（Nobel Prize in Chemistry 1960）', publisher: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/chemistry/1960/libby/facts/', accessed: '2026-11-18', note: '炭素14が大気中で宇宙線によってでき、生き物が死ぬと一定の割合で減ること、1949年にリビーが年代を測る方法を作ったこと、受賞理由。' },
    { title: 'Marie Curie and the Science of Radioactivity: The Radium Institute（Physical Decline）', publisher: 'American Institute of Physics（Center for History of Physics）', url: 'https://history.aip.org/exhibits/curie/radinst3.htm', accessed: '2026-11-18', note: '1920年代には少しの放射線は体によいと信じられ、ラジウム入りの化粧品が売られていたこと、1934年7月4日に再生不良性の悪性貧血で亡くなり、療養所の所長が長年の放射線で骨髄が傷ついたためだろうと報告したこと。' },
    { title: 'ICRP History', publisher: 'International Commission on Radiological Protection（ICRP）', url: 'https://www.icrp.org/page.asp?id=5', accessed: '2026-11-18', note: '1928〜1937年の勧告は国際X線・ラジウム防護委員会（IXRPC）が出し、1950年にICRPとして組み直されたこと。' },
  ],
}

export default chapter
