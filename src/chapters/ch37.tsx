import type { Chapter } from '../content/types'
import { Callout, ChapterLink, FigRef, Ref, Term } from '../components/content'
import { Level, Who } from '../components/history'
import { FigAnnihilation, FigBullet, FigCluster, FigContents, FigDarkEnergy, FigExpansion, FigFields, FigHubble, FigLevels, FigRotation } from '../figures/ch37'

const chapter: Chapter = {
  key: '37',
  part: 'p7',
  title: '暗黒物質、暗黒エネルギー、量子重力：未解決の問題',
  summary: '宇宙の物質の大部分は光を出さない暗黒物質で、宇宙の膨張は正体の分からない暗黒エネルギーによって加速しています。2026年11月時点の観測と研究を、確かめられた事実、有力な仮説、検証されていない候補に分けて見ていき、最後に7つの分野のつながりをふりかえります。',
  goals: [
    '銀河団と銀河の回転の観測から、見えない質量があると考えられるようになった経緯を説明できる',
    '弾丸銀河団の観測が、暗黒物質の証拠とされる理由を説明できる',
    '宇宙の加速膨張がどのように見つかり、暗黒エネルギーという考えにつながったかを説明できる',
    'DESI の結果、ハッブル定数の食い違い、量子重力の候補が、どこまで確かめられた話かを区別して説明できる',
    '物理学の7つの分野が、どの発見でつながってきたかを説明できる',
  ],
  prerequisites: ['19', '20', '29', '32', '33', '34', '35'],
  people: ['rubin', 'einstein', 'hawking'],
  events: [
    { year: 1933, title: '銀河団の見えない質量', note: 'ツビッキーがかみのけ座銀河団の銀河の速さから、光で見える物質の少なくとも400倍の密度が必要だと計算した。', section: 'missing-mass' },
    { year: 1970, title: '銀河の回転速度の観測', note: 'ルービンとフォードが、アンドロメダ銀河の外側のガスも内側と同じくらいの速さで回っていることを示した。', people: ['rubin'], section: 'missing-mass' },
    { year: 1998, title: '宇宙の加速膨張の発見', note: '2つのチームが遠くの超新星が予想より暗いことを見つけ、宇宙の膨張が加速していることを示した（2011年ノーベル物理学賞）。', section: 'acceleration' },
    { year: 2025, yearLabel: '2024〜2025年', title: 'DESI の観測結果', note: '銀河とクエーサーの大規模な地図から、暗黒エネルギーが時間とともに弱まっている可能性が示された（発見と認める基準には届いていない）。', section: 'tensions' },
  ],
  sections: [
    {
      id: 'missing-mass',
      title: '見えない質量：ツビッキーとルービン',
      body: (
        <>
          <Callout kind="evidence" title="この章の情報について">
            <p>この章の観測結果と研究の状況は、2026年11月18日に公式の発表と論文で確かめたものです。</p>
          </Callout>
          <p>
            天体が回る速さから、その内側にある質量を求められます。惑星が太陽の周りを回る速さが、太陽の質量で決まるのと同じ考え方です（<ChapterLink n="2" />）。この方法を銀河（<ChapterLink n="33" />）や、銀河が集まった銀河団に当てはめると、光で見える星やガスだけでは質量が足りないことが分かってきました。
          </p>
          <p>
            カリフォルニア工科大学のツビッキーは1933年、かみのけ座の方向にある銀河団で、7個ほどの銀河の速さに毎秒1500〜2000kmもの差があることに注目しました。光で見える星の質量から計算した重力では、これほど速い銀河を引き留められず、銀河団は散らばってしまうはずです。ツビッキーは、平均の密度が光から見積もった値の少なくとも400倍必要だと計算し、光らない物質が光る物質よりずっと多くあるのかもしれないと書きました
            <Ref n={1} />
            <Ref n={2} />。<FigRef n="37-1" />
            の左は見える物質の重力だけの場合、右は実際の銀河団です。この指摘は長く注目されませんでした
            <Ref n={3} />。
          </p>
          <FigCluster />
          <p>
            カーネギー研究所の<Who id="rubin">ヴェラ・ルービン</Who>は、同僚のケント・フォードが作った分光器（光を色に分けて記録する装置）を使い、1967年から1969年にかけて、アンドロメダ銀河の67か所でガスが回る速さを測りました。1970年に発表した結果では、中心から遠いガスも近いガスと同じくらいの速さで回っていました
            <Ref n={3} />。
          </p>
          <p>
            太陽系では、質量のほとんどが中心の太陽にあるので、遠い惑星ほどゆっくり回ります。銀河でも、光る部分に質量が集まっているなら、外側の星ほどゆっくり回るはずです。<FigRef n="37-2" />
            の右のグラフでは、点線の予想は外側で下がりますが、実線の観測はほとんど下がりません。光の届く範囲の外まで、見えない質量が広がっているからだと考えられます。その後の10年ほどで多くの渦巻銀河でも同じ結果が得られ、宇宙の物質の大部分は光を出さないという考えが受け入れられました
            <Ref n={2} />
            <Ref n={3} />
            <Level of="confirmed" />。
          </p>
          <FigRotation />
          <p>
            このように、光を出したり吸収したりせず、重力によってだけ存在が分かる物質を
            <Term def="光を出したり吸収したりせず、重力によってだけ存在が分かる物質。銀河や銀河団の質量の大部分を占めるが、正体は分かっていない。ダークマターともいう。" en="dark matter" aliases={['ダークマター']}>
              暗黒物質
            </Term>
            といいます。
          </p>
        </>
      ),
    },
    {
      id: 'evidence',
      title: '重力レンズによる証拠と、正体の探索',
      body: (
        <>
          <p>
            後ろの銀河の像のゆがみ方から質量を求める重力レンズ（<ChapterLink n="20" section="lens" />）でも、銀河団には見えている星やガスよりずっと大きな質量が見つかっています
            <Ref n={2} />
            <Level of="confirmed" />。一方で、暗黒物質のかわりに、銀河ほどの距離では重力の法則そのものが違うと考える研究者もいました。2006年8月、NASA などのチームは、約38億光年先で2つの銀河団が衝突した跡である「弾丸銀河団」の観測を発表しました。銀河団の通常の物質の大部分は、銀河の間に広がる1億度ほどのガスで、X線で見えます。衝突のとき、ガスどうしはぶつかって速さが落ち、真ん中に残りました。ところが、重力レンズで求めた質量の中心は、すれ違って先へ進んだ銀河の側にありました。質量の大部分は、ガスにぶつからずに通り抜ける見えない物質だということになり、重力の法則を変える考えでは、このずれを説明できません
            <Ref n={4} />
            <Level of="confirmed" />。<FigRef n="37-3" />
            では、最後に点線の楕円（質量）とガスの位置が分かれます。
          </p>
          <FigBullet />
          <p>
            暗黒物質の正体は、まだ見つかっていない粒子だと考えられています
            <Level of="hypothesis" />。候補の一つが、ほかの物質とほとんど反応しない重い粒子 WIMP です。アメリカの地下約1.5kmにある LZ 実験は、10トンの液体キセノンをためた装置で、WIMP がキセノンの原子にぶつかったときに出る小さな光を探しています。2026年9月、LZ は知られている原因では説明しにくい反応を1回記録したと発表しました。ただし、知られている原因で起こる確率も約0.5%あり、チームも暗黒物質を見つけたとは主張していません
            <Ref n={5} />
            <Level of="candidate" />。
          </p>
        </>
      ),
    },
    {
      id: 'acceleration',
      title: '加速する膨張と暗黒エネルギー',
      body: (
        <>
          <p>
            宇宙は膨張していて、遠い銀河ほど速く遠ざかっています（<ChapterLink n="33" />）。物質の重力が引き戻すので、膨張は遅くなっていると考えられていました
            <Ref n={7} />。膨張がどれだけ遅くなっているかを測るため、パールマッターが率いるチーム（1988年に開始）と、シュミットが率い、リースも加わったチーム（1994年の終わりに開始）が、遠くの超新星を探しました
            <Ref n={6} />。
          </p>
          <p>
            使ったのは Ia型の超新星（星の爆発、<ChapterLink n="35" />）です。本来の明るさがほぼそろっているので、見かけの明るさから距離が分かります。1998年、2つのチームは、遠くの超新星50個あまりが予想より暗い、つまり予想より遠いことを発表しました。宇宙の膨張は加速していたのです
            <Ref n={6} />
            <Level of="confirmed" />。3人は2011年のノーベル物理学賞を受けました。<FigRef n="37-4" />
            の実線のように、膨張ははじめ重力で遅くなり、途中から加速に変わったと考えられています
            <Ref n={7} />。点線は、物質の重力だけがはたらく宇宙です。
          </p>
          <FigExpansion />
          <p>
            加速の原因は分かっておらず、膨張を加速させているものを
            <Term def="宇宙全体に広がり、宇宙の膨張を加速させていると考えられている、正体の分からないエネルギー。今の宇宙の中身の約7割を占める。ダークエネルギーともいう。" en="dark energy" aliases={['ダークエネルギー']}>
              暗黒エネルギー
            </Term>
            と呼びます。最も単純な説明は、何もない空間そのものが一定のエネルギーを持つというものです。これは、<Who id="einstein">アルベルト・アインシュタイン</Who>が静止した宇宙のために一般相対性理論の式に加えた宇宙項（<ChapterLink n="33" />）と同じはたらきをします
            <Ref n={7} />
            <Ref n={10} />
            <Level of="hypothesis" />。
          </p>
          <p>
            宇宙背景放射（ビッグバンの名残の電波、<ChapterLink n="34" />）を測った Planck 衛星の2018年の結果では、<FigRef n="37-5" />
            のように、今の宇宙の中身は、通常の物質が約4.9%、暗黒物質が約26.4%、暗黒エネルギーが約68.5%です
            <Ref n={8} />。加速が続けば、銀河どうしは離れ続け、宇宙は冷えていくと考えられます
            <Ref n={6} />
            <Level of="hypothesis" />。19世紀の熱的死（<ChapterLink n="13" />）とは別の理由による見通しで、暗黒エネルギーの性質によって変わります。
          </p>
          <FigContents />
        </>
      ),
    },
    {
      id: 'tensions',
      title: '2020年代の観測：DESI とハッブル定数',
      body: (
        <>
          <p>
            DESI（暗黒エネルギー分光装置）は、アメリカのキットピーク国立天文台の望遠鏡に取り付けられ、5000個の天体の光を一度に記録します。宇宙の初めの音の波は銀河の分布に約5億光年の決まった間隔を残しました。DESI はこの間隔の見かけの大きさをさまざまな距離（さまざまな時代）で測り、過去110億年の宇宙の広がり方を調べます
            <Ref n={10} />
            <Ref n={12} />。
          </p>
          <p>
            2024年4月、DESI は1年目のデータから、標準の宇宙の模型とおおむね合う一方で、暗黒エネルギーが時間とともに変わる可能性を示す違いもあると発表しました
            <Ref n={9} />。2025年3月には、約1500万個の銀河とクエーサー（非常に明るい遠くの天体）の3年分のデータを宇宙背景放射や超新星の観測と合わせると、暗黒エネルギーが一定とするより、弱まっているとするほうがよく合うと発表しました
            <Ref n={10} />
            <Ref n={11} />。確からしさは2.8〜4.2シグマで、物理学で発見と認める基準の5シグマには届いていません（シグマは偶然では出にくいことを表す数で、3シグマなら偶然に出る確率は約0.3%）
            <Ref n={10} />
            <Level of="candidate" />。<FigRef n="37-6" />
            の実線は、2025年の解析で最もよく合った強さの変わり方で、数十億年前に最も強く、その後弱まっています
            <Ref n={11} />。2026年7月に DESI が発表した別の解析は標準の模型と合っていて、研究チームは変化の兆しが消える可能性も、より複雑な模型が必要な可能性もあるとしています
            <Ref n={12} />。
          </p>
          <FigDarkEnergy />
          <p>
            今の宇宙が膨張する速さを表す数を
            <Term def="今の宇宙が膨張する速さを表す数。326万光年離れるごとに、銀河が遠ざかる速さが毎秒何kmずつ増えるかで表すことが多い。" en="Hubble constant">
              ハッブル定数
            </Term>
            といいます。Planck 衛星の観測から標準の模型で計算した値は、326万光年ごとに毎秒約67.4kmです
            <Ref n={8} />。一方、セファイド変光星（<ChapterLink n="33" />）と超新星で近くの銀河の距離を測った SH0ES チームは、2022年に約73.0kmと発表し、2つの差は5シグマに達しています
            <Ref n={13} />
            <Level of="confirmed" />。ジェイムズ・ウェッブ宇宙望遠鏡で赤色巨星（年老いて膨らんだ星）を使って距離を測った CCHP チームは、間の約70.4kmを得ています
            <Ref n={14} />
            （<FigRef n="37-7" />）。食い違いの原因が測り方にあるのか、標準の模型に足りないものがあるのかは、2026年11月の時点で決着していません
            <Level of="candidate" />。
          </p>
          <FigHubble />
        </>
      ),
    },
    {
      id: 'antimatter-qg',
      title: '物質と反物質、ニュートリノ、量子重力',
      body: (
        <>
          <p>
            粒子と反粒子は、出会うと一緒に消えて光になります（<ChapterLink n="29" />）。ビッグバン（<ChapterLink n="34" />）の直後の熱い宇宙では、粒子と反粒子が組で生まれては消えていたと考えられます。同じ数だけあったなら光だけが残ったはずですが、今の宇宙には物質があり、反物質はほとんど見つかりません
            <Level of="confirmed" />。CERN（欧州原子核研究機構）は、何らかのしくみで反粒子10億個に対して粒子が1個ほど多くでき、その残りが今の星や私たちになったと説明しています
            <Ref n={15} />
            <Level of="hypothesis" />。<FigRef n="37-8" />
            はこれを少ない数の粒子で表した図です。
          </p>
          <FigAnnihilation />
          <p>
            1967年にソ連のサハロフは、物質が残るには、物理の法則が粒子と反粒子をわずかに区別する必要があると指摘しました。クォークではこの区別が見つかっていますが（<ChapterLink n="31" />）、差を生むには小さすぎます。日本の T2K 実験は2020年、ニュートリノと反ニュートリノのふるまいの違いを3シグマで示しました。この違いが物質の多さを生んだという考えは、まだ候補の段階です
            <Ref n={16} />
            <Level of="candidate" />。
          </p>
          <p>
            ニュートリノは飛ぶ間に種類が変わることから質量を持つと分かり（<ChapterLink n="32" />）、質量をゼロとしていた標準模型は完全な理論ではないことになりました
            <Ref n={17} />
            <Level of="confirmed" />。ドイツの KATRIN 実験は2025年、その質量が電子の100万分の1より小さいと発表しましたが、なぜこれほど軽いのかは分かっていません
            <Ref n={18} />。
          </p>
          <p>
            重力を時空の曲がりとして説明する一般相対性理論（<ChapterLink n="19" />）と、原子より小さな世界を扱う量子力学（<ChapterLink n="24" />）は、どちらも実験とよく合いますが、2つをまとめた理論はまだありません。重力を量子力学の考え方で扱う理論を
            <Term def="重力を量子力学の考え方で扱う理論。一般相対性理論と量子力学をまとめる理論として研究されているが、まだ完成しておらず、実験による確認もない。" en="quantum gravity">
              量子重力
            </Term>
            といいます。ブラックホールの中心や宇宙の始まりでは、一般相対性理論の計算で密度が限りなく大きくなり、理論が使えなくなります（<ChapterLink n="35" />）。量子重力はこうした場面も説明できると期待されています
            <Ref n={19} />。
          </p>
          <p>
            候補の一つの
            <Term def="物質をつくる粒子を、点ではなく非常に小さなひもの振動として表す理論。振動のしかたの一つが重力を伝える粒子に当たるので、量子重力の候補とされる。空間が9次元、時間が1次元の世界で成り立つ。" en="superstring theory">
              超弦理論
            </Term>
            は粒子を非常に小さなひもの振動として表します。1970年ごろ強い力を説明するために考えられたひもの理論に、重力を伝える粒子に当たる振動が含まれることが、1970年代の半ばに分かりました
            <Ref n={19} />
            <Level of="candidate" />。もう一つの候補のループ量子重力は、1986年のアシュテカーの研究と1987年のロヴェッリとスモーリンの研究から始まり、空間の面積や体積がとびとびの値しかとれないことを導きます
            <Ref n={20} />
            <Level of="candidate" />。
          </p>
          <p>
            どちらも実験では確かめられていません。量子重力の効果を直接調べるには銀河ほどの大きさの加速器が必要だとされ、<Who id="hawking">スティーヴン・ホーキング</Who>が1974年に予言したブラックホールからの放射（ホーキング放射、<ChapterLink n="35" />）も、まだ観測されていません
            <Ref n={19} />
            <Level of="candidate" />。<FigRef n="37-9" />
            に、この章の問題を確かさの3段階に分けてまとめました。
          </p>
          <FigLevels />
        </>
      ),
    },
    {
      id: 'look-back',
      title: '物理学の歴史をふりかえる',
      body: (
        <>
          <p>
            <FigRef n="37-10" />
            は、この本でたどった7つの分野と、分野どうしをつないだ主な発見をまとめた図です。
          </p>
          <FigFields />
          <ul>
            <li>
              古典力学（<ChapterLink n="1" />〜<ChapterLink n="5" />）の方法は、電気の力の測定（<ChapterLink n="6" />）や気体の分子の運動の説明（<ChapterLink n="14" />）にも使われました。
            </li>
            <li>
              電磁気学（<ChapterLink n="6" />〜<ChapterLink n="10" />）が示した光の速さをめぐる問題から、相対性理論が生まれました（<ChapterLink n="16" />、<ChapterLink n="17" />）。
            </li>
            <li>
              熱力学・統計力学（<ChapterLink n="11" />〜<ChapterLink n="15" />）で扱った熱した物が出す光から、エネルギーのつぶの考えが生まれました（<ChapterLink n="21" />）。
            </li>
            <li>
              相対性理論（<ChapterLink n="16" />〜<ChapterLink n="20" />）のうち一般相対性理論は、宇宙の膨張の計算に使われています（<ChapterLink n="33" />）。
            </li>
            <li>
              量子力学（<ChapterLink n="21" />〜<ChapterLink n="26" />）は、特殊相対性理論と合わせて反粒子を予言しました（<ChapterLink n="29" />）。
            </li>
            <li>
              量子場理論・素粒子物理学（<ChapterLink n="27" />〜<ChapterLink n="32" />）の知識は、星の一生や元素のでき方の説明にも使われています（<ChapterLink n="34" />、<ChapterLink n="35" />）。
            </li>
          </ul>
          <p>
            宇宙論・重力理論（<ChapterLink n="33" />〜<ChapterLink n="37" />）は、これらの理論を宇宙全体に当てはめてきました。この章の問題も1つの分野だけでは解けず、暗黒物質には素粒子物理学と宇宙論が、量子重力には相対性理論と量子力学が関わります。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章の要点',
      body: (
        <ul>
          <li>ツビッキー（1933年）とルービンら（1970年）の観測から、光で見える物質よりずっと多くの質量があると分かった。この見えない質量を暗黒物質という。</li>
          <li>重力レンズと弾丸銀河団（2006年）の観測から暗黒物質の存在は確かめられているが、正体の粒子は見つかっていない。</li>
          <li>1998年、遠くの超新星の観測から宇宙の膨張の加速が見つかった。原因は暗黒エネルギーと呼ばれ、Planck 衛星の2018年の結果では今の宇宙の約68.5%を占める。</li>
          <li>DESI の2024年と2025年の結果は暗黒エネルギーが弱まっている可能性を示したが、発見の基準には届いていない。ハッブル定数は測り方によって値が食い違っている。</li>
          <li>反物質がほとんどない理由、ニュートリノが非常に軽い理由、重力と量子力学をまとめる量子重力は、2026年11月時点で未解決である。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Redshift of Extragalactic Nebulae（F. Zwicky, 1933 の英訳、H. Andernach 訳）', publisher: 'arXiv', url: 'https://arxiv.org/abs/1711.01693', accessed: '2026-11-18', version: '原論文 Helvetica Physica Acta 6巻 110〜127ページ（1933年）、英訳 arXiv:1711.01693（2017年）', note: 'かみのけ座銀河団で銀河の速さに少なくとも毎秒1500〜2000kmの差があること、7個ほどの銀河にもとづくこと、平均の密度が光る物質から見積もった値の少なくとも400倍必要なこと、光る物質だけなら銀河団は散らばるはずだという議論、「暗黒物質」（dunkle Materie）の語、カリフォルニア工科大学の所属。' },
    { title: 'Dark Matter', publisher: 'NASA Science', url: 'https://science.nasa.gov/dark-matter/', accessed: '2026-11-18', note: 'スイス生まれのツビッキーの1933年のかみのけ座銀河団の研究、1970年代のルービンの渦巻銀河の観測で暗黒物質の考えが受け入れられたこと、重力レンズのゆがみから銀河団の質量の分布を調べること。このページの割合（通常の物質5%、暗黒物質27%、暗黒エネルギー68%）は2013年の Planck の値に近く、本文では資料[8]の2018年の値を使った。' },
    { title: 'Seeing dark matter in the Andromeda galaxy（V. Rubin）', publisher: 'Physics Today 59巻12号 8ページ（アメリカ物理学協会）', url: 'https://physicstoday.aip.org/opinion/seeing-dark-matter-in-the-andromeda-galaxy', accessed: '2026-11-18', version: '2006年12月', note: 'フォードの分光器で露光の時間が10分の1になったこと、1967年から1969年に M31 の67か所の速さを測ったこと、1970年の論文（ApJ 159巻 379ページ）、外側でも速さが落ちないこと、1930年代のツビッキーらの考えがほとんど無視されたこと、その後10年ほどで暗黒物質の考えが受け入れられたこと。' },
    { title: 'NASA Finds Direct Proof of Dark Matter', publisher: 'NASA チャンドラX線観測衛星（ハーバード・スミソニアン天体物理学センター）', url: 'https://chandra.harvard.edu/press/06_releases/press_082106.html', accessed: '2026-11-18', version: '2006年8月21日', note: '弾丸銀河団 1E 0657-56、高温のガスの質量が星よりずっと大きいこと、ガスが衝突で減速し暗黒物質は減速しなかったこと、重力の法則を変える考えでは説明できないこと。距離約38億光年は同じサイトの画像のページ（chandra.harvard.edu/photo/2006/1e0657/）による。論文は Clowe ほか、ApJ 648巻 L109（2006年）。' },
    { title: 'LZ sees surprising result in search for dark matter', publisher: 'SLAC 国立加速器研究所（ローレンス・バークレー国立研究所の発表）', url: 'https://www6.slac.stanford.edu/news/2026-09-01-lz-sees-surprising-result-search-dark-matter', accessed: '2026-11-18', version: '2026年9月1日', note: 'LZ が10トンの液体キセノンで WIMP を探していること、地下約1マイル（約1.6km）のサンフォード地下研究施設、知られている原因では説明しにくい反応を1回記録したこと、2.6シグマ（知られている原因で起こる確率約0.5%）、チームが暗黒物質を見たとは主張していないこと。' },
    { title: 'The Nobel Prize in Physics 2011 - Press release', publisher: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/2011/press-release/', accessed: '2026-11-18', version: '2011年10月4日', note: 'パールマッター（1988年に開始したチーム）、シュミット（1994年の終わりに開始したチーム）、リースの受賞と受賞理由、1998年の発表、Ia型超新星が太陽ほどの質量で地球ほどの大きさの星の爆発で銀河1つ分ほどの光を出すこと、50個あまりの超新星が予想より暗かったこと、加速が続けば宇宙は冷えて終わるという見通し。' },
    { title: 'Dark Energy', publisher: 'NASA Science', url: 'https://science.nasa.gov/dark-energy/', accessed: '2026-11-18', note: '重力で膨張が減速すると考えられていたこと、宇宙の膨張がはじめ減速し途中から加速に変わったこと。このページは加速に変わった時期を宇宙の始まりから約90億年後としているが、図37-4の転換点は Planck 2018 の値で計算した位置で、年は本文に書いていない。' },
    { title: 'Planck 2018 results. VI. Cosmological parameters', publisher: 'Planck Collaboration、Astronomy & Astrophysics 641巻 A6（arXiv:1807.06209）', url: 'https://arxiv.org/abs/1807.06209', accessed: '2026-11-18', version: '2018年（2020年掲載）', note: 'ハッブル定数67.4（誤差0.5）、物質の割合0.315、暗黒エネルギーの割合0.6847、通常の物質と暗黒物質の密度の値。割合4.9%と26.4%は、密度の値とハッブル定数から計算した。' },
    { title: 'First results from DESI make most precise measurement of our expanding universe', publisher: 'SLAC 国立加速器研究所（ローレンス・バークレー国立研究所の発表）', url: 'https://www6.slac.stanford.edu/news/2024-04-04-first-results-desi-make-most-precise-measurement-our-expanding-universe', accessed: '2026-11-18', version: '2024年4月4日', note: '1年目のデータで過去110億年の宇宙の広がり方を1%より細かい精度で測ったこと、標準の模型とおおむね合う一方で暗黒エネルギーが変わる可能性を示す違いがあること。対象の天体が600万個あまりであることは DESI 2024 VI の論文（arXiv:2404.03002）による。' },
    { title: 'New DESI results strengthen hints that dark energy may evolve', publisher: 'フェルミ国立加速器研究所（ローレンス・バークレー国立研究所の発表の転載）', url: 'https://news.fnal.gov/2025/03/new-desi-results-strengthen-hints-that-dark-energy-may-evolve/', accessed: '2026-11-18', version: '2025年3月19日', note: '3年分・約1500万個の銀河とクエーサー、DESI だけなら標準の模型と合うこと、ほかの観測と合わせると弱まる暗黒エネルギーが合うこと、2.8〜4.2シグマ、3シグマは偶然の確率0.3%、発見の基準は5シグマ、宇宙項が暗黒エネルギーの最も単純な場合であること、キットピークの口径4mの望遠鏡と5000個の天体の同時観測。' },
    { title: 'DESI DR2 Results II: Measurements of Baryon Acoustic Oscillations and Cosmological Constraints', publisher: 'DESI Collaboration（arXiv:2503.14738）', url: 'https://arxiv.org/abs/2503.14738', accessed: '2026-11-18', version: '2025年3月', note: '1400万個あまりの銀河とクエーサーの3年分のデータ、2.8〜4.2シグマ、DESI と宇宙背景放射と DES の超新星を合わせたときに最もよく合う暗黒エネルギーの変わり方の値（図37-6の形の計算に使った）、近い時代では暗黒エネルギーが弱まり、赤方偏移0.4付近より前の時代では逆に強まっていく形であること。' },
    { title: 'New DESI DR2 Lyman-alpha Results Shed Light on Dark Energy', publisher: 'DESI（ローレンス・バークレー国立研究所）', url: 'https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/', accessed: '2026-11-18', version: '2026年7月30日', note: 'クエーサーの光を吸収する水素ガスを使った新しい解析が標準の模型と合ったこと、変化の兆しが消える可能性とより複雑な模型が必要な可能性、銀河の分布に残る間隔が約150メガパーセク（約5億光年に当たる）であること、約110億年前の光を使うこと。' },
    { title: 'A Comprehensive Measurement of the Local Value of the Hubble Constant with 1 km/s/Mpc Uncertainty from the Hubble Space Telescope and the SH0ES Team', publisher: 'A. G. Riess ほか、Astrophysical Journal Letters 934巻 L7（arXiv:2112.04510）', url: 'https://arxiv.org/abs/2112.04510', accessed: '2026-11-18', version: '2022年', note: 'セファイド変光星と Ia型超新星によるハッブル定数73.04（誤差1.04）、Planck と標準の模型からの値と5シグマの差があり、原因が分かっていないこと。' },
    { title: 'Status Report on the Chicago-Carnegie Hubble Program (CCHP): Measurement of the Hubble Constant Using the Hubble and James Webb Space Telescopes', publisher: 'W. L. Freedman ほか（arXiv:2408.06153）', url: 'https://arxiv.org/abs/2408.06153', accessed: '2026-11-18', version: '2024年8月初版、2025年3月改訂版', note: '赤色巨星の明るさの上限を使ったハッブル定数70.39（統計誤差1.22、系統誤差1.33、超新星による誤差0.70。図37-7ではまとめて約1.9とした）。' },
    { title: 'Antimatter', publisher: 'CERN（欧州原子核研究機構）', url: 'https://home.cern/science/physics/antimatter', accessed: '2026-11-18', note: 'ビッグバン直後に粒子と反粒子が組で生まれ消えていたこと、宇宙に反物質がほとんどないこと、未知のしくみで反粒子10億個に対して粒子が1個ほど多くできたという説明。2008年のノーベル物理学賞の一般向け解説は「100億個に1個」としており、資料によって桁が違う。' },
    { title: 'Constraint on the matter–antimatter symmetry-violating phase in neutrino oscillations', publisher: 'T2K Collaboration、Nature 580巻 339〜344ページ', url: 'https://www.nature.com/articles/s41586-020-2177-0', accessed: '2026-11-18', version: '2020年', note: 'サハロフ（1967年）が物質と反物質の差には粒子と反粒子を区別する対称性の破れが必要だとしたこと、クォークの破れでは小さすぎること、ニュートリノでの破れを3シグマで示したこと、ニュートリノの破れが差を生む考え（レプトジェネシス）。' },
    { title: 'The Nobel Prize in Physics 2015 - Press release', publisher: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/2015/press-release/', accessed: '2026-11-18', note: 'ニュートリノが種類を変えることから質量を持つと分かったこと、標準模型はニュートリノの質量をゼロとしていたので完全な理論ではないこと。' },
    { title: 'Astroparticle physics: Neutrinos weigh less than 0.45 electronvolts - precision scale KATRIN sets new record', publisher: 'マックス・プランク核物理学研究所（カールスルーエ工科大学などの共同発表）', url: 'https://www.mpi-hd.mpg.de/mpi/en/public-relations/news/news-item/katrin-sets-new-limit-for-neutrino-mass', accessed: '2026-11-18', version: '2025年4月（論文は Science 388巻 180〜185ページ）', note: 'ニュートリノの質量の上限0.45電子ボルト、ニュートリノが電子より少なくとも100万倍軽いこと、軽さの理由が理論の課題であること。' },
    { title: 'Quantum Gravity', publisher: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/quantum-gravity/', accessed: '2026-11-18', version: '2024年2月26日改訂', note: '量子重力が一般相対性理論と量子論をまとめる理論であること、特異点の問題、ひもの理論が1970年ごろ強い力のために考えられ1970年代半ばに重力を伝える粒子の振動が見つかったこと、空間9次元と時間1次元、量子重力の実験がないこと、銀河ほどの大きさの加速器が必要なこと、ホーキング放射（1974年）が観測されていないこと。' },
    { title: 'Loop Quantum Gravity（C. Rovelli）', publisher: 'Living Reviews in Relativity 1巻 1号（arXiv:gr-qc/9710008）', url: 'https://arxiv.org/abs/gr-qc/9710008', accessed: '2026-11-18', version: '1998年', note: '1986年のアシュテカーの変数、1987年のロヴェッリとスモーリンのループ表示、面積と体積がとびとびの値をとること（1994年）。' },
  ],
}

export default chapter
