import type { Chapter } from '../content/types'
import { Callout, ChapterLink, FigRef, Ref, Term } from '../components/content'
import { Level, Who } from '../components/history'
import { FigBands, FigExclusion, FigGradient, FigLaser, FigQubit, FigRoad26, FigSG, FigShells, FigTable, FigTunnel } from '../figures/ch26'

const chapter: Chapter = {
  key: '26',
  part: 'p5',
  title: 'スピンと周期表、量子力学から生まれた技術',
  summary: '1922年のシュテルン・ゲルラッハの実験と、1925年の排他原理とスピンの考えから、電子が原子の中にどう入るかが分かり、周期表の並び方が説明されました。トンネル効果、半導体、レーザー、量子コンピューターは、量子力学の性質を使う技術です。',
  goals: [
    'シュテルン・ゲルラッハの実験で何が見つかり、その解釈が1922年と現在でどう違うかを説明できる',
    'パウリの排他原理と電子のスピンを使って、周期表の並び方を説明できる',
    'トンネル効果とは何か、江崎玲於奈のダイオードで何が確かめられたかを説明できる',
    '半導体、レーザー、量子コンピューターが、量子力学のどの性質を使っているかを説明できる',
  ],
  prerequisites: ['13', '21', '22', '23', '24'],
  people: ['pauli', 'bohr', 'gamow', 'einstein', 'feynman'],
  events: [
    { year: 1922, title: '銀原子の流れの分裂', note: 'シュテルンとゲルラッハが、磁場を通した銀の原子の流れが上下の2つに分かれることを見つけた。分かれた原因は、のちに電子のスピンだと分かった。', section: 'stern-gerlach' },
    { year: 1925, title: '排他原理とスピン', note: 'パウリが、原子の中で2個の電子が同じ状態をとれないという排他原理を示し、ウーレンベックとハウトスミットが電子のスピンを提案した。', people: ['pauli'], section: 'spin' },
    { year: 1957, title: '江崎ダイオード', note: '江崎玲於奈が、半導体の部品の中で電子がトンネル効果で壁を抜けることを示した。', section: 'tunnel' },
    { year: 1960, title: '最初のレーザー', note: 'メイマンが人工のルビーを使い、誘導放出で光を強める装置を初めて動かした。', section: 'semiconductor-laser' },
  ],
  sections: [
    {
      id: 'stern-gerlach',
      title: 'シュテルン・ゲルラッハの実験（1922年）',
      body: (
        <>
          <p>
            1913年の<Who id="bohr">ニールス・ボーア</Who>の原子模型では、電子は原子核のまわりの決まった軌道だけを回ります（<ChapterLink n="22" />）。1916年にはゾンマーフェルトらが、磁場の中では軌道の面の向きもとびとびに限られると考えました。これを方向の量子化といいます
            <Ref n={2} />。
          </p>
          <p>
            一方で、説明できないことも残っていました。磁場の中の原子が出す光の線が予想より複雑に分かれる異常ゼーマン効果と、電子がなぜすべて最も内側の軌道に入らないのかという問いです
            <Ref n={1} />。この章の前半では、この2つが電子の新しい性質で説明されるまでを、後半では量子力学の性質を使う技術をたどります（<FigRef n="26-1" />）。
          </p>
          <FigRoad26 />
          <p>
            方向の量子化を確かめる実験を考えたのは、ドイツのフランクフルト大学のオットー・シュテルンです。ボーアの模型では、回る電子のために原子は小さな磁石になります。小さな磁石は、場所によって強さの違う磁場の中では、向きによって上か下へ押されます（<FigRef n="26-2" />）。古典物理学（量子力学より前の物理学）では磁石の向きはばらばらなので、原子の流れは上下に広がるだけです。ボーアの模型が正しければ、流れは2本に分かれるはずでした
            <Ref n={2} />。
          </p>
          <FigGradient />
          <p>
            実験は同じ大学のヴァルター・ゲルラッハと進めました。熱した銀から飛び出す原子を細い流れにし、磁石のすき間を通してガラス板に付けます（<FigRef n="26-3" />）。シュテルンが1921年10月にロストック大学へ移ったあとは、ゲルラッハが続けました。1922年2月7日から8日にかけての夜、ゲルラッハは、板に付いた銀が上下の2か所に分かれたことを確かめました。2か所の間は約0.1mmでした
            <Ref n={3} />。ゲルラッハはボーアに写真を付けた絵はがきを送り、「あなたの理論が確かめられたことをお祝いします」と書きました
            <Ref n={2} />。
          </p>
          <FigSG />
          <p>
            板に付く銀は薄くて見えにくく、シュテルンはのちに、安い葉巻の硫黄を含んだ息で銀が黒く変わり、跡が見えたと語っています。2002年の再現実験では、息ではなく葉巻の煙で銀が黒くなりました
            <Ref n={2} />。1933年9月、ユダヤ系のシュテルンはナチス政権のもとでドイツを離れることを強いられ、アメリカに移りました。1943年には原子の流れを使う研究でノーベル物理学賞を受けています
            <Ref n={3} />。
          </p>
        </>
      ),
    },
    {
      id: 'spin',
      title: 'パウリの排他原理と電子のスピン（1925年）',
      body: (
        <>
          <p>
            オーストリア出身の<Who id="pauli">ヴォルフガング・パウリ</Who>は1924年の秋、電子には古典物理学では説明できない、2つの値をとる性質があると提案しました。さらに、原子の中の電子の状態を4つの数の組で表し、2個の電子が同じ組をとることはないという規則にまとめて、1925年に発表しました
            <Ref n={1} />。この原理を
            <Term def="原子の中で、2個の電子が同じ状態をとることはできないという原理。1925年にパウリが示した。電子はエネルギーの低い状態から順に1個ずつ入るので、殻が内側から順に埋まる。" en="Pauli exclusion principle" aliases={['排他原理']}>
              パウリの排他原理
            </Term>
            といい、パウリはこの発見で1945年のノーベル物理学賞を受けました
            <Ref n={1} />。
          </p>
          <p>
            1つの状態には電子が1個しか入れないので、電子はエネルギーの低い状態から順に埋まっていきます（<FigRef n="26-4" />）。電子がすべて最も内側に入らない理由は、この原理で説明できます。
          </p>
          <FigExclusion />
          <p>
            ただ、4つ目の数が何を表すのかは分かっていませんでした
            <Ref n={1} />。1925年の夏、オランダのライデン大学でエーレンフェストに学んでいたウーレンベックとハウトスミットは、電子が自転していて、そのために小さな磁石になっていると考えました。磁石の向きが2つあるとすると、異常ゼーマン効果がうまく説明できました
            <Ref n={1} />
            <Ref n={4} />。この電子の性質を
            <Term def="電子などの粒子が持つ、自転の勢いに当たる性質。電子はスピンのために小さな磁石としてふるまい、磁場の中で測ると向きは2つのどちらかしか現れない。ふつうの物の自転とは違う、量子力学に特有の性質。" en="spin">
              スピン
            </Term>
            といいます。
          </p>
          <p>
            ハウトスミットの1971年の回想によると、ローレンツに難点を指摘されたウーレンベックが論文を止めようとしたとき、エーレンフェストはすでに雑誌に送っていました。エーレンフェストはハウトスミットに「よい考えだが、間違っているかもしれない。でも君たちにはまだ評判がないから、失うものはない」と言ったといいます
            <Ref n={4} />。パウリは初め反対しましたが、1926年のトーマスの計算を見て受け入れました
            <Ref n={1} />
            <Ref n={4} />。
          </p>
          <p>
            スピンはふつうの物の自転とは違う、量子力学に特有の性質と考えられています
            <Ref n={1} />。1922年の実験の見方も変わりました。銀の原子では軌道の運動による磁石の性質は0で、流れが2つに分かれたのは電子のスピンのためでした。ボーアの模型と合ったのは偶然だったのです。分裂の原因をスピンとする論文が現れたのは1927年とみられています
            <Ref n={2} />。
          </p>
        </>
      ),
    },
    {
      id: 'periodic-table',
      title: '周期表の並び方の理由',
      body: (
        <>
          <p>
            1869年、ロシアのメンデレーエフは、元素を原子の重さの順に並べると似た性質の元素が周期的に現れることを、表にまとめました
            <Ref n={5} />
            <Ref n={6} />。このような表を
            <Term def="元素を原子番号の順に並べ、性質の似た元素が同じ列に来るように折り返した表。1869年にメンデレーエフが示した表がもとになっている。" en="periodic table">
              周期表
            </Term>
            といいます。ボーアは1922年のノーベル賞講演で、周期表の順番を表す番号（原子番号。<ChapterLink n="27" />）は、原子の中の電子の数と同じだと述べています
            <Ref n={5} />。周期表の段の長さには、2、8、18、32という数が現れます
            <Ref n={1} />。
          </p>
          <p>
            原子の中の電子の状態は、エネルギーの近いものがまとまって
            <Term def="原子の中で、エネルギーの近い電子の状態をまとめたもの。内側から1番目、2番目…と数え、入れる電子の数は2個、8個、18個…と決まっている。" en="electron shell">
              電子殻
            </Term>
            をつくります。スピンの2つの向きも数に入れると、内側から1番目の殻には2個、2番目には8個、3番目には18個の電子が入れます
            <Ref n={1} />。原子番号が1つ増えるごとに、電子は排他原理に従って1個ずつ低い状態から殻を埋めていきます（<FigRef n="26-5" />）。
          </p>
          <FigShells />
          <p>
            元素の性質は主にいちばん外側の殻の電子で決まります。外側の殻の電子がそろったヘリウム、ネオン、アルゴンは、ほとんど反応しません。外側の電子が1個のリチウム、ナトリウム、カリウムは、性質がよく似ています（<FigRef n="26-6" />）。カリウムの19番目の電子は、3番目の殻に空きがあっても4番目の殻に入ります。そのほうがエネルギーが低いからです
            <Ref n={5} />。
          </p>
          <FigTable />
        </>
      ),
    },
    {
      id: 'tunnel',
      title: 'トンネル効果と江崎ダイオード',
      body: (
        <>
          <p>
            山を越えるだけのエネルギーがないボールは、必ずはね返ります。ところが電子の波は、壁（エネルギーの山）の中で急に小さくなるものの0にはならず、壁が薄ければ一部が向こう側へ抜けます。波の大きいところほど電子は見つかりやすいので（<ChapterLink n="24" />）、電子は一定の確率で壁の向こうに現れます
            <Ref n={7} />。この現象を
            <Term def="エネルギーが足りず、古典物理学では越えられないはずの壁（エネルギーの山）を、電子などの粒子が一定の確率で通り抜ける現象。粒子の波が壁の中で0にならないために起こる。" en="tunnel effect">
              トンネル効果
            </Term>
            といいます（<FigRef n="26-7" />）。1928年、<Who id="gamow">ジョージ・ガモフ</Who>は、重い原子核の一部が飛び出して別の元素に変わる現象を、トンネル効果で説明しました（<ChapterLink n="27" />）
            <Ref n={8} />。
          </p>
          <FigTunnel />
          <p>
            1957年、東京通信工業（現在のソニー）の江崎玲於奈は、不純物を多く混ぜたゲルマニウムの部品に電圧をかけると、電圧を上げているのに電流が減る範囲があることを見つけ、それがトンネル効果によることを示しました。この部品は半導体（電気の通しやすさが金属と絶縁体の中間の物質。次の節）でできたダイオードで、エサキダイオード（トンネルダイオード）と呼ばれます
            <Ref n={7} />
            <Ref n={9} />。江崎はこの研究で1973年のノーベル物理学賞を受けました
            <Ref n={9} />。
          </p>
          <p>
            トンネル効果は超伝導（冷やすと電気抵抗が0になる現象。<ChapterLink n="13" />）を1957年に量子力学で説明したBCS理論を確かめる実験にも使われました
            <Ref n={10} />。1984年から1985年には、クラーク、デボレ、マルティニスが、超伝導の回路全体が1つの粒子のようにトンネル効果を起こすことを示し、2025年のノーベル物理学賞を受けています
            <Ref n={8} />。
          </p>
        </>
      ),
    },
    {
      id: 'semiconductor-laser',
      title: '半導体とレーザー',
      body: (
        <>
          <p>
            ここからは量子力学を使う技術を、どの性質を使っているかに絞って見ていきます。原子1個の電子のエネルギー準位はとびとびですが（<ChapterLink n="22" />）、たくさんの原子が並んだ結晶では、近い準位が集まって幅のある帯になります。電子は排他原理に従って下から帯を埋め、埋まりきった帯の電子は電流を運べません
            <Ref n={11} />。埋まった帯と次の空いた帯のすき間が大きい物質は絶縁体（電気を通さない物。<ChapterLink n="6" />）で、すき間が小さく、熱や光で一部の電子が上の帯へ移れる物質が
            <Term def="電気の通しやすさが導体と絶縁体の中間にある物質。ケイ素（シリコン）やゲルマニウムなど。温度や混ぜる不純物の量で、電気の通しやすさが大きく変わる。" en="semiconductor">
              半導体
            </Term>
            です（<FigRef n="26-8" />）。ケイ素やゲルマニウムがその例で、混ぜる不純物で電気の通しやすさを変えられます。帯の考えで半導体を説明する理論は、1931年にウィルソンがまとめました
            <Ref n={11} />。
          </p>
          <FigBands />
          <p>
            1947年の末、アメリカのベル研究所のバーディーンとブラッテンは、ゲルマニウムに2本の金の端子を当てて、電気の信号を大きくする部品を作りました。真空管の働きを固体でする初めての部品で、
            <Term def="半導体でできた部品で、小さな電流や電圧の変化で大きな電流を制御する。電気の信号を大きくしたり、電流を流したり止めたりできる。最初のものは1947年に作られた。" en="transistor">
              トランジスタ
            </Term>
            と呼ばれます。2人とショックレーは1956年のノーベル物理学賞を受けました
            <Ref n={12} />。
          </p>
          <p>
            1917年、<Who id="einstein">アルベルト・アインシュタイン</Who>は、エネルギーの高い状態の原子に光子（光のエネルギーのつぶ。<ChapterLink n="21" />）が当たると、色も向きも波の山の位置もそろった光子がもう1つ出ることを理論で示しました
            <Ref n={13} />。これを
            <Term def="エネルギーの高い状態にある原子に、2つの状態のエネルギーの差に当たる光子が来ると、それと同じ色・同じ向きの光子が新たに出る現象。1917年にアインシュタインが理論で示した。" en="stimulated emission">
              誘導放出
            </Term>
            といいます。高い状態の原子を多くしておき、両端の鏡の間で光を往復させると、光は誘導放出で強まり、一部を通す鏡から外に出ます（<FigRef n="26-9" />）
            <Ref n={13} />。この装置とその光を
            <Term def="誘導放出を使って光を強めて出す装置。また、その装置が出す、色と向きと波の山の位置がそろった光。最初のものは1960年にメイマンが作った。" en="laser">
              レーザー
            </Term>
            といいます。1960年5月16日、アメリカのヒューズ研究所のメイマンが、人工のルビーにランプの強い光を当てて最初のレーザーを動かしました
            <Ref n={14} />
            <Ref n={15} />。レーザーは通信や医療などに広く使われ
            <Ref n={14} />、<ChapterLink n="20" />の光格子時計にも使われています。
          </p>
          <FigLaser />
        </>
      ),
    },
    {
      id: 'quantum-computer',
      title: '量子コンピューターの考え方',
      body: (
        <>
          <p>
            1981年の春、マサチューセッツ工科大学とIBMが開いた会議で、<Who id="feynman">リチャード・ファインマン</Who>は量子力学に従う粒子のふるまいをふつうのコンピューターで計算すると、扱う範囲を2倍にしただけで必要な計算機が爆発的に大きくなると指摘しました。そして、量子力学に従う部品でできたコンピューターなら自然をまねて計算できるだろうと述べ、「自然は古典的ではない。自然をまねて計算したいなら、量子力学に従うものにしたほうがよい」と結びました。講演は1982年に論文になりました
            <Ref n={16} />
            <Ref n={17} />。
          </p>
          <p>
            このような計算機を
            <Term def="量子ビットの重ね合わせや量子もつれを使って計算するコンピューター。ある種の問題を、ふつうのコンピューターよりはるかに少ない手順で解けると考えられている。" en="quantum computer">
              量子コンピューター
            </Term>
            といいます。ふつうのコンピューターのビットは0か1のどちらかを表しますが、量子コンピューターの
            <Term def="量子コンピューターで情報を表す単位。ふつうのビットは0か1のどちらかだが、量子ビットは0と1の重ね合わせの状態をとれ、測ると0か1のどちらかが出る。" en="qubit">
              量子ビット
            </Term>
            は0と1の重ね合わせ（1つの物が複数の状態を同時にとること。<ChapterLink n="24" />）の状態をとり、測ると0か1のどちらかが出ます。量子ビットの間には量子もつれ（離れた粒子の測定結果がそろう関係。<ChapterLink n="25" />）もつくれます。量子ビットが1個増えるごとに、全体の状態を書き表すのに必要な数は2倍になります（<FigRef n="26-10" />）
            <Ref n={19} />。超伝導の回路を使う量子ビットは2025年のノーベル賞の研究につながっています
            <Ref n={8} />。
          </p>
          <FigQubit />
          <p>
            1994年、アメリカのショアは、大きな数を素数の掛け算に分ける素因数分解を、量子コンピューターなら桁数が増えても手順が急には増えずに行える方法を示しました
            <Ref n={18} />。インターネットの暗号の一部は素因数分解の難しさを利用しているため、アメリカの国立標準技術研究所（NIST）は2024年、量子コンピューターでも解きにくい暗号の標準を発表しました
            <Ref n={21} />。
          </p>
          <Callout kind="evidence" title="量子コンピューターの現状（2026年11月の時点で確かめた情報）">
            <ul>
              <li>
                2019年、Google は53個の量子ビットで、スーパーコンピューターなら約1万年かかる計算を約200秒で行ったと発表し
                <Ref n={19} />、IBM は2.5日でできると反論しました
                <Ref n={20} />。決まった計算で量子コンピューターのほうが速いという主張は、検証が続いています <Level of="hypothesis" />
              </li>
              <li>
                2024年12月、Google は、誤りを直すために組み合わせる量子ビットを増やすほど誤りが減ることを、101個の量子ビットまで示しました
                <Ref n={22} /> <Level of="confirmed" />
              </li>
              <li>
                Google の2025年の見積もりでは、広く使われている暗号の一つを破るには約100万個の量子ビットが要ります。当時の誤りの少ない量子コンピューターは100〜1000個程度でした
                <Ref n={23} />。実際の暗号をショアの方法で破ることは、実験では確かめられていません <Level of="candidate" />
              </li>
            </ul>
          </Callout>
          <p>
            スピン、排他原理、トンネル効果、エネルギー準位、重ね合わせといった量子力学の性質は、元素の性質から電子機器や量子コンピューターまでを説明しています。排他原理は星の一生を考えるときにも使われます（<ChapterLink n="35" />）。第6部では、原子核とその中の粒子に進みます（<ChapterLink n="27" />）。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章の要点',
      body: (
        <ul>
          <li>1922年、シュテルンとゲルラッハは、磁場を通した銀の原子の流れが2つに分かれることを見つけた。原因はのちに電子のスピンだと分かった。</li>
          <li>1925年、パウリは2個の電子が同じ状態をとれないという排他原理を示し、ウーレンベックとハウトスミットは電子のスピンを提案した。</li>
          <li>電子は排他原理に従い、エネルギーの低い殻から順に入る。周期表で性質が繰り返すのは、外側の殻の電子の数が繰り返すためである。</li>
          <li>電子の波は壁の中で0にならず、一定の確率で壁を抜ける（トンネル効果）。1957年に江崎玲於奈が半導体の部品で示した。</li>
          <li>半導体は結晶の中の電子の帯と排他原理を、レーザーは誘導放出を使う。</li>
          <li>量子コンピューターは重ね合わせと量子もつれを使う。役に立つ問題で従来のコンピューターを上回るかは、まだ確かめられている途中である。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Exclusion principle and quantum mechanics（Nobel Lecture）', publisher: 'Wolfgang Pauli, NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/1945/pauli/lecture/', accessed: '2026-11-18', version: '1946年12月13日の講演', note: '異常ゼーマン効果が当時の原子の模型で説明できなかったこと、電子がすべて最も内側の殻に入らない理由をボーアが根本問題としていたこと、1922年秋のコペンハーゲン滞在、1924年秋の「古典的に記述できない二価性」の提案、ストーナーの指摘、1925年の排他原理の発表、周期の長さ2、8、18、32、ウーレンベックとハウトスミットのスピン、トーマスの計算でパウリがスピンを受け入れたこと、スピンが量子力学に特有の性質だとボーアが示したこと、1945年のノーベル賞。' },
    { title: 'Stern and Gerlach: How a Bad Cigar Helped Reorient Atomic Physics', publisher: 'Bretislav Friedrich, Dudley Herschbach, Physics Today 56(12), 53–59（AIP）', url: 'https://physicstoday.aip.org/features/stern-and-gerlach-how-a-bad-cigar-helped-reorient-atomic-physics', accessed: '2026-11-18', version: '2003年12月号', note: '1916年のゾンマーフェルトとデバイの方向の量子化、古典物理学では流れが広がるだけでボーアの模型では2つに分かれると予想されたこと、葉巻の話とそれを確かめた再現実験、1922年初めにあきらめかけたこと、鉄道のストライキ、1922年2月8日付けのボーアへの絵はがき、銀の原子の軌道の角運動量は0で分裂はスピンによること、分裂をスピンとした最初の論文が1927年とみられること、ゲルラッハが1944年にドイツの核研究計画の責任者になったこと。' },
    { title: 'The Stern-Gerlach Experiment Revisited', publisher: 'Horst Schmidt-Böcking ほか、arXiv:1609.09311（European Physical Journal H 41, 327–364 に掲載）', url: 'https://arxiv.org/abs/1609.09311', accessed: '2026-11-18', version: '2016年9月30日版', note: 'シュテルンが1921年10月にロストック大学へ移ったこと、1922年2月7日から8日の夜にゲルラッハが分裂を確かめたこと、分かれた2本の間が約0.1mmだったこと、シュテルンが1933年9月にユダヤ系であることを理由にドイツを離れ、カーネギー工科大学に移ったこと、1943年のノーベル物理学賞。' },
    { title: 'The discovery of the electron spin', publisher: 'S. A. Goudsmit（J. H. van der Waals 訳）、ライデン大学ローレンツ研究所', url: 'https://lorentz.leidenuniv.nl/history/spin/goudsmit.html', accessed: '2026-11-18', version: '1971年4月のオランダ物理学会での講演の英訳', note: 'ウーレンベックが電子の自転を思いついた経緯、ローレンツの指摘、論文を止めようとしたときにはエーレンフェストが送ったあとだったこと、エーレンフェストの言葉、トーマスの計算とパウリが受け入れたこと。' },
    { title: 'The structure of the atom（Nobel Lecture）', publisher: 'Niels Bohr, NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/1922/bohr/lecture/', accessed: '2026-11-18', version: '1922年12月11日の講演', note: 'メンデレーエフとロータル・マイヤーが元素の性質の周期性を見つけたこと、原子番号がふつうの原子の電子の数に等しいこと、アルカリ金属の性質が似ていること、カリウムの19番目の電子が4番目の殻の軌道に入り、スカンジウムから3番目の殻の電子が増えること。' },
    { title: 'IUPAC and the International Year of the Periodic Table', publisher: 'IUPAC（国際純正・応用化学連合）', url: 'https://iupac.org/iypt2019/', accessed: '2026-11-18', note: '2019年の国際周期表年が、メンデレーエフが1869年に示した形の周期表を記念したものであること。' },
    { title: 'Long journey into tunneling（Nobel Lecture）', publisher: 'Leo Esaki, NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/1973/esaki/lecture/', accessed: '2026-11-18', version: '1973年12月12日の講演', note: '波動方程式の解が古典的に入れない領域でも0にならないことからトンネル効果が導かれること、1928年に強い電場による金属からの電子の放出がトンネル効果で説明され、ガモフらが原子核の崩壊を説明したこと、江崎が1956年に半導体のダイオードのトンネル効果の研究を始め、冷やした部品で負性抵抗を初めて見たこと。' },
    { title: 'Popular information: The Nobel Prize in Physics 2025', publisher: 'NobelPrize.org（スウェーデン王立科学アカデミー）', url: 'https://www.nobelprize.org/prizes/physics/2025/popular-information/', accessed: '2026-11-18', note: '1928年にガモフがトンネル効果で原子核の崩壊を説明したこと、ジョセフソン接合、1984〜1985年のクラーク、デボレ、マルティニスの実験で回路全体がトンネル効果ととびとびのエネルギーを示したこと、マルティニスがこれを量子ビットに使い、超伝導の回路が量子コンピューターの方法の一つであること。' },
    { title: 'Invention of tunnel diode - Esaki diode（Japan Semiconductor Innovation 50, D-1）', publisher: '半導体産業人協会 日本半導体歴史館', url: 'https://shmj.or.jp/innovation50/english/detail_D01E.htm', accessed: '2026-11-18', note: '1957年に東京通信工業（現在のソニー）の江崎玲於奈が、不純物を多く混ぜたダイオードで負性抵抗を見つけ、トンネル現象であることを示したこと、同じ年の日本物理学会と翌年のブリュッセルの国際会議で報告されたこと、高周波の発振や速い切り替えへの応用、1973年のノーベル物理学賞。' },
    { title: 'Press release: The 1972 Nobel Prize in Physics', publisher: 'NobelPrize.org（スウェーデン王立科学アカデミー）', url: 'https://www.nobelprize.org/prizes/physics/1972/press-release/', accessed: '2026-11-18', note: '1957年にバーディーン、クーパー、シュリーファーが超伝導の理論をつくったこと、量子力学のトンネル現象を使う超伝導の研究とジョセフソン効果がこの理論を確かめたこと。' },
    { title: 'Semiconductor research leading to the point contact transistor（Nobel Lecture）', publisher: 'John Bardeen, NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/1956/bardeen/lecture/', accessed: '2026-11-18', version: '1956年12月11日の講演', note: '原子のとびとびの準位が結晶では帯になること、埋まりきった帯の電子は電流を運ばず、金属は帯が途中まで埋まり、絶縁体と半導体には帯の間のすき間があること、ウィルソンが1931年に帯の考えで半導体の理論をまとめたこと、ゲルマニウムとケイ素の性質を不純物で変えられること。' },
    { title: 'November 17 - December 23, 1947: Invention of the First Transistor（This Month in Physics History）', publisher: 'APS News（アメリカ物理学会）', url: 'https://www.aps.org/apsnews/2000/11/this-month-in-physics-history', accessed: '2026-11-18', version: '2000年11月', note: '1947年11月17日から12月23日にベル研究所のバーディーン、ブラッテン、ショックレーが最初の点接触トランジスタを作ったこと、ゲルマニウムと2つの金の端子を使ったこと、真空管の増幅を固体で行う初めての部品で1956年のノーベル物理学賞を受けたこと。' },
    { title: 'Production of coherent radiation by atoms and molecules（Nobel Lecture）', publisher: 'Charles H. Townes, NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/1964/townes/lecture/', accessed: '2026-11-18', version: '1964年12月11日の講演', note: '1917年にアインシュタインが光と原子のやり取りを調べ、誘導放出を含む関係を示したこと、誘導放出で出る光は当てた光と同じ振動数と形を持ち、位相がそろうこと、高い状態の原子が多いと光が強まること。' },
    { title: 'Hughes Research Laboratories（APS Historic Sites）', publisher: 'APS（アメリカ物理学会）', url: 'https://aps.org/funding-recognition/historic-sites/hughes', accessed: '2026-11-18', note: '1917年のアインシュタインの誘導放出、1950年代のタウンズのメーザー、1960年5月16日にヒューズ研究所でメイマンが人工のルビーと光のパルスで最初のレーザーを動かしたこと、レーザーが通信、バーコードの読み取り、医療などに使われていること。' },
    { title: 'Stimulated Optical Radiation in Ruby', publisher: 'T. H. Maiman, Nature 187, 493–494', url: 'https://www.nature.com/articles/187493a0', accessed: '2026-11-18', version: '1960年8月6日号', note: 'ルビー（クロムを含むコランダム）を光で励起し、誘導放出による赤い光（波長6943オングストローム）を得たことの報告。' },
    { title: 'Tomorrow’s Computer, Yesterday', publisher: 'MIT Endicott House（マサチューセッツ工科大学）', url: 'https://mitendicotthouse.org/tomorrows-computer-yesterday/', accessed: '2026-11-18', note: '1981年の春に MIT と IBM が Endicott House で最初の計算の物理学の会議を開き、約50人の研究者が集まり、ファインマンらの考えが量子コンピューターの研究の始まりになったこと。' },
    { title: 'Simulating Physics with Computers', publisher: 'Richard P. Feynman, International Journal of Theoretical Physics 21, 467–488（モスクワ大学の研究室が公開している誌面の写しで確認）', url: 'https://vql.cs.msu.ru/Feynman.pdf', accessed: '2026-11-18', version: '1982年（1981年5月7日受付、doi:10.1007/BF02650179）', note: '会議の基調講演であること、量子力学に従う系をふつうのコンピューターで計算すると、系の大きさを2倍にしたとき必要な計算機の大きさが爆発的に増えること、量子力学に従う部品でできた量子コンピューターなら計算できそうだという提案、講演の最後の「nature isn’t classical, dammit, and if you want to make a simulation of nature, you’d better make it quantum mechanical」。' },
    { title: 'Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer', publisher: 'Peter W. Shor, arXiv:quant-ph/9508027', url: 'https://arxiv.org/abs/quant-ph/9508027', accessed: '2026-11-18', version: '1994年11月の Foundations of Computer Science の会議録の論文を広げた版（1996年1月改訂）', note: '量子コンピューターで素因数分解を、桁数に対して手順の数が急に増えない方法で行えること、素因数分解の難しさが暗号に使われていること。' },
    { title: 'Quantum supremacy using a programmable superconducting processor', publisher: 'F. Arute ほか（Google）、Nature 574, 505–510', url: 'https://www.nature.com/articles/s41586-019-1666-5', accessed: '2026-11-18', version: '2019年10月23日', note: '超伝導の量子ビット53個で、状態の数が約1京（2の53乗）の計算をし、約200秒の計算がスーパーコンピューターでは約1万年かかると見積もったこと。' },
    { title: 'On “Quantum Supremacy”', publisher: 'IBM Research Blog', url: 'https://www.ibm.com/quantum/blog/on-quantum-supremacy', accessed: '2026-11-18', version: '2019年10月22日', note: 'Google と同じ計算を、ふつうのコンピューターで2.5日で行えるとする反論。' },
    { title: 'NIST Releases First 3 Finalized Post-Quantum Encryption Standards', publisher: 'NIST（アメリカ国立標準技術研究所）', url: 'https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards', accessed: '2026-11-18', version: '2024年8月13日', note: '量子コンピューターが現在の暗号を破るおそれに備え、量子コンピューターでも解きにくい問題を使う暗号の標準を発表したこと。' },
    { title: 'Quantum error correction below the surface code threshold', publisher: 'Google Quantum AI ほか、Nature 638, 920–926', url: 'https://www.nature.com/articles/s41586-024-08449-y', accessed: '2026-11-18', version: '2024年12月9日オンライン公開', note: '超伝導の量子ビットを組み合わせる数を増やすほど誤りが減ることを、101個の量子ビットを使う符号まで示したこと。' },
    { title: 'Tracking the Cost of Quantum Factoring', publisher: 'Google Online Security Blog', url: 'https://security.googleblog.com/2025/05/tracking-cost-of-quantum-factori.html', accessed: '2026-11-18', version: '2025年5月23日', note: '2048ビットのRSA暗号は、誤りのある量子ビット約100万個で約1週間の計算で破れるとする見積もり、誤りの少ない量子コンピューターの量子ビットが当時100〜1000個程度であること、1994年のショアの方法以来、必要な量子ビットの見積もりが減ってきたこと。' },
  ],
}

export default chapter
