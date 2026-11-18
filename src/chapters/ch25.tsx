import type { Chapter } from '../content/types'
import { Callout, ChapterLink, FigRef, Ref, Term } from '../components/content'
import { Level, Who } from '../components/history'
import { FigAspect, FigBell, FigCards, FigCat, FigEPR, FigNoSignal, FigPhotonBox, FigRoad25, FigSameAngle, FigThirty } from '../figures/ch25'

const chapter: Chapter = {
  key: '25',
  part: 'p5',
  title: 'アインシュタインとボーアの論争と量子もつれ',
  summary: 'アインシュタインは、量子力学は自然を完全には書き表していないと考え、ボーアと論争しました。1964年にベルがこの論争を実験で確かめられる形にし、1972年以降の実験で、量子もつれの結びつきは「隠れた変数」では説明できないと分かりました。',
  goals: [
    'アインシュタインとボーアが、1927年と1930年のソルベー会議と1935年のEPRの論文で何を争ったかを説明できる',
    '量子もつれとは何かと、シュレーディンガーの猫の思考実験が何を問題にしたかを説明できる',
    '装置の向きを変えて測ると、隠れた変数の考えと量子力学の予想に違いが出ることを、図を使って説明できる',
    'クラウザーとアスペの実験と2015年の実験が何を確かめたかと、量子もつれで光より速く情報を送れない理由を説明できる',
  ],
  prerequisites: ['18', '20', '21', '23', '24'],
  people: ['einstein', 'bohr', 'schrodinger', 'born'],
  events: [
    { year: 1935, title: 'EPRの論文', note: 'アインシュタイン、ポドルスキー、ローゼンが、離れた2つの粒子の思考実験から、量子力学の記述は完全ではないと論じた。', people: ['einstein'], section: 'epr' },
    { year: 1964, title: 'ベルの不等式', note: 'ベルが、局所的な隠れた変数の考えと量子力学の予想が、装置の向きを変えた測定で食い違うことを示した。', section: 'bell' },
    { year: 1972, title: 'クラウザーらの実験', note: 'フリードマンとクラウザーが、カルシウムの原子が出す光子の対を測り、ベルの不等式が破られ、量子力学の予想と合うことを示した。', section: 'experiments' },
    { year: 1982, title: 'アスペの実験', note: 'アスペらが、光子が飛んでいる間に測る装置の向きを切り替えても、ベルの不等式が破られることを示した。', section: 'experiments' },
  ],
  sections: [
    {
      id: 'questions',
      title: 'ソルベー会議での論争',
      body: (
        <>
          <p>
            1926年、<Who id="born">マックス・ボルン</Who>は、波動関数（電子などにともなう波を表すもの。<ChapterLink n="23" />）から分かるのは、粒子がその場所に見つかる確率だけだと考えました（<ChapterLink n="24" section="born" />）。1個の電子がどこに見つかるかは、前もって決まりません。これを理論に欠けている点とみるかどうかが、この章の論争の出発点です。主な出来事は<FigRef n="25-1" />のとおりです。
          </p>
          <FigRoad25 />
          <p>
            <Who id="einstein">アルベルト・アインシュタイン</Who>は1926年12月4日のボルンあての手紙に、次のように書きました
            <Ref n={1} />。
          </p>
          <blockquote>
            <p>
              量子力学はたしかに堂々としたものです。しかし内なる声が、これはまだ本物ではないと私に告げています。この理論は多くのことを語りますが、「老いた方」の秘密に私たちを近づけてはくれません。いずれにしても私は、あの方はサイコロを振らないと確信しています。
            </p>
          </blockquote>
          <p>「老いた方」は神を指します。よく引かれる「神はサイコロを振らない」という言葉は、この文がもとになっています。</p>
          <p>
            1927年10月の第5回ソルベー会議（<ChapterLink n="24" section="solvay" />）で、アインシュタインは<Who id="bohr">ニールス・ボーア</Who>と議論しました。アインシュタインは思考実験（実際には行わず、頭の中で結果を考える実験）を出し、不確定性原理が許すより正確に粒子の様子を知れると示そうとしました。不確定性原理は位置と運動量のような2つの量を、同時にはいくらでも正確には決められないという原理です。ボーアは測る装置にも不確定性原理が当てはまることを使って、一つずつ答えました
            <Ref n={2} />
            <Ref n={6} />。ボーアの回想では、アインシュタインはこのとき、神がサイコロ遊びをすると本当に信じられるのかと、からかうように尋ねています
            <Ref n={2} />。
          </p>
          <FigPhotonBox />
          <p>
            1930年の第6回ソルベー会議で、アインシュタインは<FigRef n="25-2" />の光の箱を考えました。箱の中の時計が決まった時刻にふたを一瞬開け、光子（光のエネルギーのつぶ。<ChapterLink n="21" />）を1個だけ外へ出します。質量とエネルギーは互いに移り変わるので（<ChapterLink n="18" />）、出る前と後の箱の重さの差から光子のエネルギーが分かります。こうして、光子が出た時刻とエネルギーの両方を正確に知れる、という主張でした
            <Ref n={3} />。
          </p>
          <p>
            ボーアは箱をばねばかりにつるして量る場合を考えました。重さを細かく量ろうとするほど、箱の高さははっきりしなくなります。一般相対性理論によると、重力のはたらく所では時計の進み方が高さによって違います（<ChapterLink n="20" />）。そのため時計の示す時刻もあいまいになり、時刻とエネルギーの両方は正確に知れません
            <Ref n={4} />。アインシュタイン自身の理論が、その反論に答えるのに使われたのです。この後のアインシュタインは、量子力学の計算が実験と合うことは疑いませんでした。問題にしたのは、量子力学が自然を完全に書き表しているかという点です
            <Ref n={6} />。
          </p>
        </>
      ),
    },
    {
      id: 'epr',
      title: 'EPRの論文（1935年）',
      body: (
        <>
          <p>
            アメリカのプリンストン高等研究所にいたアインシュタインは、研究員のポドルスキー、ローゼンと論文を書き、1935年5月15日発行の『フィジカル・レビュー』誌に載せました。題は「物理的実在の量子力学による記述は完全とみなせるか」で、3人の頭文字からEPRの論文と呼ばれます
            <Ref n={3} />
            <Ref n={5} />。
          </p>
          <FigEPR />
          <p>
            論文は<FigRef n="25-3" />のような場面を考えました。ぶつかった2つの粒子AとBが、反対向きに遠く離れていきます。量子力学では2つの位置の関係と、運動量（質量と速さを掛け合わせた量）の関係を、両方とも決めておけます。そのため、Aの位置を測ればBの位置が、Aの運動量を測ればBの運動量が、Bに触れずに分かります
            <Ref n={3} />。
          </p>
          <p>
            EPRは物に触れずにある量の値を確実に予言できるなら、その値は実際にあると考えました
            <Ref n={5} />。Aで何を測るかは、遠く離れた所で後から選べます。Aでの選択が遠くのBを変えないなら、Bは位置と運動量の両方の値を初めから持っていたことになります。ところが量子力学の波動関数は、2つの値を同時には表せません。そこでEPRは、量子力学の記述は完全ではないと結論しました
            <Ref n={3} />。
          </p>
          <p>
            ここで前提になっているのは、ある場所での出来事が光より速く遠くへ影響しないという考えで、これを
            <Term def="ある場所での出来事は、その近くにしか直接影響せず、光より速く遠くの物に影響を及ぼすことはない、という考え。" en="locality">局所性</Term>
            といいます。また、測る前から結果を決めている性質が粒子にあり、量子力学がそれを書き表していないとすれば、その性質を
            <Term def="量子力学の波動関数には含まれていないが、測定の結果を前もって決めていると考えられた粒子の性質。EPRの論文のあと、量子力学を補うものとして考えられた。" en="hidden variables">隠れた変数</Term>
            と呼びます
            <Ref n={7} />。
          </p>
          <p>
            ボーアは10月に同じ題の論文で反論しました。Aの位置を測る装置と運動量を測る装置は、同時には置けません。何を予言できるかは、どの装置を置くかという実験の条件全体で決まる、というのがボーアの答えです
            <Ref n={2} />
            <Ref n={3} />。どちらの考えでも計算の結果は同じなので、当時の多くの物理学者は、この論争は実験では決められないと考えました
            <Ref n={6} />。
          </p>
        </>
      ),
    },
    {
      id: 'cat',
      title: 'シュレーディンガーの猫と「もつれ」（1935年）',
      body: (
        <>
          <p>
            <Who id="schrodinger">エルヴィン・シュレーディンガー</Who>はEPRの論文についてアインシュタインと手紙をやりとりしました
            <Ref n={3} />。1935年のケンブリッジ哲学協会の紀要の論文では、一度力を及ぼし合った2つのものは、離れたあとも、それぞれを自分だけの波動関数で表せなくなると指摘し、「私はこれを、量子力学の特徴の一つではなく、まさにその特徴と呼びたい」と書いています
            <Ref n={7} />
            <Ref n={9} />。シュレーディンガーはこの状態を「もつれた」と表しました。この結びつきを
            <Term def="2つ以上の粒子が一度関わり合ったあと、離れても1つのまとまりとして表され、片方を測った結果ともう片方を測った結果が結びついている状態。1935年にシュレーディンガーが名付けた。" en="quantum entanglement">量子もつれ</Term>
            といいます。
          </p>
          <FigCat />
          <p>
            同じ年の別の論文で、シュレーディンガーは<FigRef n="25-4" />の思考実験を書きました。閉じた鋼鉄の箱に、猫と仕掛けを入れます。放射性の物質はごく少量で、1時間のうちに原子が1個崩れることと、1個も崩れないことが同じくらいの確率で起こります。原子が崩れると検出器が反応し、金づちが毒の入った小さなびんを割ります
            <Ref n={8} />。
          </p>
          <p>
            1時間後の箱の中を波動関数で書くと、原子と猫の状態がもつれ、生きた猫と死んだ猫が半分ずつ重なり合ったもの（重ね合わせ。<ChapterLink n="24" section="complementarity" />）になります。シュレーディンガーは、原子の重ね合わせが猫のような大きな物にまで広がる「ばかげた場合」を示し、波動関数をそのまま実際の様子とみることの難しさを指摘したのです
            <Ref n={3} />
            <Ref n={8} />。
          </p>
        </>
      ),
    },
    {
      id: 'bell',
      title: 'ベルの不等式（1964年）',
      body: (
        <>
          <p>
            1951年、アメリカのボームはEPRの思考実験を、2通りの結果しか出ない量で考え直しました
            <Ref n={3} />。のちの実験では、光の
            <Term def="光の波が揺れる向きがそろっていること、またはその揺れる向き。偏光の装置（偏光板）は、決まった向きに揺れる光だけを通す。偏光のサングラスはこの性質を使っている。" en="polarization">偏光</Term>
            が使われます。光は電場と磁場の揺れが伝わる波です（<ChapterLink n="9" />）。光子1個は偏光の装置を通るか止められるかのどちらかです。
          </p>
          <FigSameAngle />
          <p>
            原子が続けて出す2個の光子は、偏光がもつれた対になります。<FigRef n="25-5" />のように2つの装置を同じ向きにすると、1個ずつの結果はでたらめなのに、AとBの結果は毎回そろいます
            <Ref n={6} />
            <Ref n={9} />。
          </p>
          <FigCards />
          <p>
            結果がそろう理由には、<FigRef n="25-6" />の2つの考え方があります。隠れた変数の考えでは、2つの光子は「どの向きなら通るか」を書いた同じ指示書を持って光源を出ます。量子力学では、結果は測ったときに初めて決まります。同じ向きで測るかぎり、どちらでも結果はそろうので、区別できません。
          </p>
          <p>
            1952年、ボームは隠れた変数を使って量子力学と同じ予想を出す理論をつくりました。これに刺激を受けたCERN（欧州合同原子核研究機関）のジョン・ベルは、1964年11月に論文「EPRのパラドックスについて」を発表しました
            <Ref n={10} />。ベルは2つの装置の向きを変えて測ることを考えました。隠れた変数と局所性の両方が成り立つなら、結果の結びつきの強さには限度があります。この関係を
            <Term def="隠れた変数があり局所性も成り立つなら、離れた2か所の測定結果の結びつきの強さには超えられない限度がある、という関係。1964年にベルが示した。量子力学は、装置の向きによってはこの限度を超えると予想する。" en="Bell's inequality">ベルの不等式</Term>
            といい、量子力学は、向きによってはこの限度を超えると予想します
            <Ref n={9} />
            <Ref n={14} />。
          </p>
          <FigThirty />
          <p>
            のちに考えられた簡単な形で説明します（<FigRef n="25-7" />）。量子力学では、向きの差が30度なら結果が食い違う組は4分の1、60度なら4分の3です
            <Ref n={9} />。隠れた変数で考えると、Aだけを30度回したとき、指示書の答えが0度のときから変わる組は4分の1です。Bだけを反対へ30度回したときも4分の1です。両方を回して差を60度にすると、食い違うのは、どちらかの答えが変わった組だけです。そのため食い違いは、多くても4分の1を2つ合わせた半分です。量子力学の4分の3は、この限度を超えます。
          </p>
          <FigBell />
          <p>
            <FigRef n="25-8" />では、向きの差ごとに、結果がそろう割合を比べられます。実線が量子力学の予想、点線が隠れた変数でつくった例です。向きの差が22.5度のとき、量子力学では約85%、点線の例では75%がそろいます。ベルは、隠れた変数をどう工夫しても、すべての角度で実線に合わせられないことを示しました
            <Ref n={14} />。
          </p>
        </>
      ),
    },
    {
      id: 'experiments',
      title: 'クラウザーとアスペの実験',
      body: (
        <>
          <p>
            1969年、クラウザー、ホーン、シモニー、ホルトの4人は、ベルの不等式を実際の装置で確かめられる形に書き直しました。1972年、カリフォルニア大学バークレー校のフリードマンとクラウザーは、カルシウムの原子が続けて出す光子の対を測りました。約200時間かけた測定の結果は、ベルの不等式の限度をはっきり超え、量子力学の予想と合いました
            <Ref n={9} />
            <Ref n={11} />。
          </p>
          <p>
            ただし、抜け穴が残っていました。装置の向きは前もって決まっていたので、片方の向きが何かの方法でもう片方に伝わり、結果を左右した可能性を消せません。また、検出器が数えられるのは光子の一部なので、数えた光子だけが偏っていた可能性も残ります
            <Ref n={6} />
            <Ref n={9} />。
          </p>
          <FigAspect />
          <p>
            フランスの光学研究所（オルセー）のアスペたちは、1982年に<FigRef n="25-9" />の実験を行いました。左右の切替は光子の行き先を約1億分の1秒ごとに、向きの違う2つの偏光の装置の間で変えます。左右の装置は約12m離れていて、光でも約1億分の4秒かかるので、片方の向きを光の速さで知らせても、もう片方の測定には間に合いません。結果は量子力学の予想と合い、ベルの不等式は破られていました
            <Ref n={12} />
            <Ref n={13} />。ただし切り替えは決まった周期で、でたらめではありませんでした
            <Ref n={6} />
            <Ref n={14} />。
          </p>
          <p>
            1998年には、オーストリアのツァイリンガーのグループが、400m離した2か所で、乱数で選んだ向きを使って確かめました
            <Ref n={14} />。2015年には、オランダのデルフト工科大学、ウィーン大学、アメリカ国立標準技術研究所（NIST）の3つのグループが、2つの抜け穴を同時にふさいだ実験を発表しました
            <Ref n={6} />
            <Ref n={15} />。どの実験でもベルの不等式は破られ、局所的な隠れた変数では説明できない結果になりました <Level of="confirmed" />。
          </p>
        </>
      ),
    },
    {
      id: 'after',
      title: '2022年のノーベル賞とその後',
      body: (
        <>
          <p>
            2022年のノーベル物理学賞は、アスペ、クラウザー、ツァイリンガーの3人に贈られました。受賞理由は「もつれた光子を使った実験で、ベルの不等式が破られることを確かめ、量子情報科学の先駆けとなった」ことです
            <Ref n={16} />。
          </p>
          <FigNoSignal />
          <p>
            量子もつれについてよくある誤解は、もつれを使えば光より速く情報を送れる、というものです。実際には送れません
            <Ref n={17} />。<FigRef n="25-10" />で、Aさんが自分の結果だけを見ると、通る光子はいつも約半分で、並びはでたらめです。Bさんが装置をどの向きにしても、この割合は変わりません
            <Ref n={6} />。Bさんの選んだ向きが表れるのは、2人の結果を並べて、そろった割合を数えたときだけです。並べるには、Bさんの結果を電話や光ファイバーのような普通の方法で受け取る必要があり、その連絡は光より速くは届きません（<ChapterLink n="18" section="light-cone" />）。
          </p>
          <p>
            ツァイリンガーたちは、もつれを使う技術の研究も進めました。1997年には粒子の量子の状態を離れた粒子へ移す量子テレポーテーションを行い、2006年にはカナリア諸島の144km離れた島の間で、もつれた光子の対を使って暗号の鍵を共有しました
            <Ref n={9} />。重ね合わせや量子もつれを使って計算する量子コンピューターの考え方は、<ChapterLink n="26" />で扱います。
          </p>
          <Callout kind="evidence" title="量子もつれをどう理解するか">
            <p>
              局所的な隠れた変数が否定されたあとも、量子もつれをどう理解するかには、一致した答えがありません
              <Ref n={18} />。コペンハーゲン解釈（<ChapterLink n="24" section="complementarity" />）のほかに、測定のたびに世界が分かれるとするエヴェレットの多世界解釈（1957年）や、局所性を満たさない隠れた変数を使うボームの理論（1952年）があります <Level of="candidate" />。これらは普通の量子力学と違う予想を出さず、実験で区別されていません
              <Ref n={9} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章の要点',
      body: (
        <ul>
          <li>アインシュタインは確率しか与えない量子力学に満足せず、1927年と1930年のソルベー会議でボーアと論争した。光の箱の反論に、ボーアは一般相対性理論で答えた。</li>
          <li>1935年のEPRの論文は、局所性を認めるなら量子力学の記述は完全ではないと論じた。ボーアは、実験の条件全体を考えるべきだと反論した。</li>
          <li>同じ年、シュレーディンガーは離れても1つとして表される状態を「もつれ」と呼び、猫の思考実験で波動関数の解釈の難しさを示した。</li>
          <li>1964年にベルは、装置の向きを変えて測れば、隠れた変数の考えと量子力学の予想が食い違うことを示した（ベルの不等式）。</li>
          <li>1972年、1982年、2015年の実験でベルの不等式は破られ、量子力学の予想どおりになった。2022年のノーベル物理学賞はこの研究に贈られた。</li>
          <li>片方の結果だけからは相手の装置の向きは分からないので、量子もつれで光より速く情報を送ることはできない。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Albert Einstein to Max Born 1', publisher: 'Physics Today 58(5), 16（AIP）。Irene Born Newton-John 訳、Max Born の注釈つき', url: 'https://physicstoday.aip.org/letters/albert-einstein-to-max-born-1', accessed: '2026-11-18', version: '2005年5月号（The Born-Einstein Letters から転載）', note: '1926年12月4日のボルンあての手紙の本文。本文の引用はこの英訳から訳した。ドイツ語の原文は「老いた方（der Alte）」と書いており、神という語は使っていない。' },
    { title: 'Discussion with Einstein on Epistemological Problems in Atomic Physics', publisher: 'Niels Bohr、Atomic Physics and Human Knowledge（1958年）所収。バード大学図書館が公開するPDF', url: 'https://bard.edu/library/pdfs/archives/2024/12/Bohr-AtomicPhysics.pdf', accessed: '2026-11-18', version: '初出は Albert Einstein: Philosopher-Scientist（1949年）', note: '1927年10月の第5回ソルベー会議でのアインシュタインとの議論、アインシュタインが神のサイコロ遊びについてからかうように尋ねたこと、1930年の会議で議論が劇的になったこと、EPRへの反論の要旨。このPDFは1930年の光の箱の部分のページが欠けているため、その部分は資料[3][4]で確かめた。' },
    { title: 'The Einstein-Podolsky-Rosen Argument in Quantum Theory', publisher: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/qt-epr/', accessed: '2026-11-18', version: '2017年10月31日改訂版', note: '1930年のソルベー会議の光の箱（時計とふたのある箱から光子を出す思考実験）、EPRの論文の議論の内容、ポドルスキーが執筆し1935年3月に投稿したこと、6月19日のシュレーディンガーあての手紙の不満、ボーアの反論、アインシュタインの8月8日の火薬の例と、シュレーディンガーの9月19日の返事の猫の例、1951年のボームの書き直し。' },
    { title: "Einstein's photon box revisited", publisher: 'Heinz-Jürgen Schmidt、International Journal of Theoretical Physics 61, 197（arXiv:2112.14659）', url: 'https://arxiv.org/abs/2112.14659', accessed: '2026-11-18', version: '2022年', note: '光の箱の思考実験に対するボーアの答え。ばねばかりで量る箱の位置のあいまいさと、重力による時計の進み方の違いから、時刻があいまいになること。' },
    { title: 'Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?', publisher: 'A. Einstein, B. Podolsky, N. Rosen、Physical Review 47, 777（APS）', url: 'https://journals.aps.org/pr/abstract/10.1103/PhysRev.47.777', accessed: '2026-11-18', version: '1935年3月25日受付、5月15日発行', note: '論文の題と発行日、物を乱さずに確実に予言できる量には実在が対応するという条件、量子力学の記述は完全ではないという結論。' },
    { title: 'Closing the Door on Einstein and Bohr’s Quantum Debate', publisher: 'Alain Aspect、Physics 8, 123（APS）', url: 'https://physics.aps.org/articles/v8/123', accessed: '2026-11-18', version: '2015年12月16日', note: '1927年のソルベー会議でボーアがアインシュタインの反論に答えたこと、アインシュタインは量子力学の予想の正しさは疑わなかったこと、各側の結果は半々でたらめで同じ向きなら完全にそろうこと、局所性と検出の抜け穴、1982年の切り替えが完全にはでたらめでなかったこと、2015年のデルフト（1.3km）、ウィーン、NISTの実験。' },
    { title: 'Quantum Entanglement and Information', publisher: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/qt-entangle/', accessed: '2026-11-18', version: '2023年5月2日改訂版', note: '量子力学の状態に含まれない性質を隠れた変数と呼ぶこと、1935年のケンブリッジ哲学協会の紀要の論文でシュレーディンガーが entanglement という語を使い、量子力学の特徴そのものと書いたこと。' },
    { title: 'The Present Situation in Quantum Mechanics（猫の部分の英訳の引用）', publisher: 'Kansas State University Physics Education Research Group。J. D. Trimmer の英訳（Proceedings of the American Philosophical Society 124, 1980）から引用', url: 'https://perg.phys.ksu.edu/classes/conckirsten/modulef/cat/header.html', accessed: '2026-11-18', note: '猫の思考実験の内容。鋼鉄の部屋、1時間に原子が1個崩れるかどうかが同じ確率の少量の放射性物質、計数管が反応すると金づちが青酸の小びんを割ること、波動関数の中で生きた猫と死んだ猫が等しく混ざること、ばかげた場合も考えられるという書き出し。' },
    { title: 'Scientific Background to the Nobel Prize in Physics 2022', publisher: 'スウェーデン王立科学アカデミー、NobelPrize.org', url: 'https://www.nobelprize.org/uploads/2026/05/advanced-physicsprize-2022-5.pdf', accessed: '2026-11-18', version: '2022年10月4日', note: 'シュレーディンガーの1935年の文、ボーム、フォン・ノイマンの証明、エヴェレットとボームの理論が違う予想を出さないこと、CHSHの1969年の提案、フリードマンとクラウザーの実験（カルシウム、約200時間）、偏光の向きの差による一致の割合、アスペの実験（光源から各装置まで6m、装置の間12m、約10ナノ秒ごとの切り替え）、2006年の144kmの暗号鍵、ベル（1928〜1990年）。' },
    { title: 'November 1964: John Stewart Bell Quietly Rings in New Era of Quantum Theory（This Month in Physics History）', publisher: 'APS News（アメリカ物理学会）、Dan Garisto', url: 'https://www.aps.org/apsnews/2022/10/john-stewart-bell-quantum-theory', accessed: '2026-11-18', version: '2022年10月13日', note: 'ベルの経歴（1928年ベルファスト生まれ、1960年からCERN）、1932年のフォン・ノイマンの証明、1952年のボームの理論、1964年11月の論文が新しい雑誌 Physics に載り長く注目されなかったこと。' },
    { title: 'Experimental Test of Local Hidden-Variable Theories', publisher: 'S. J. Freedman, J. F. Clauser、Physical Review Letters 28, 938（APS）', url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.28.938', accessed: '2026-11-18', version: '1972年4月3日発行', note: 'カルシウムの原子が続けて出す光子の偏光の結びつきを測り、局所的な隠れた変数の制限が破られ、量子力学の予想と合ったこと。' },
    { title: "Experimental Test of Bell's Inequalities Using Time-Varying Analyzers", publisher: 'A. Aspect, J. Dalibard, G. Roger、Physical Review Letters 49, 1804（APS）', url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.49.1804', accessed: '2026-11-18', version: '1982年12月20日発行', note: '光の振り分けの装置と2つの偏光の装置を組み合わせ、光子が飛ぶ時間より短い時間で向きを切り替えたこと、結果が量子力学の予想と合いベルの不等式を破ったこと。' },
    { title: 'Quantum entanglement: from a philosophical debate to the Nobel Prize', publisher: 'École polytechnique（エコール・ポリテクニーク）', url: 'https://www.polytechnique.edu/en/news/quantum-entanglement-philosophical-debate-nobel-prize', accessed: '2026-11-18', note: 'アスペたちの実験で装置の向きが10ナノ秒ごとに変わり、12m離れた装置の間を信号が渡るには40ナノ秒かかったこと。' },
    { title: "Bell's Theorem", publisher: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/bell-theorem/', accessed: '2026-11-18', version: '2024年1月25日改訂版', note: '局所性の条件を満たす理論は量子力学の確率をすべては再現できないこと、アスペたちの切り替えが準周期的ででたらめではなかったこと（スイッチの間を光が渡る時間を43ナノ秒としている）、1998年のツァイリンガーらの400m離した実験、2015年の3つの実験。' },
    { title: "NIST Team Proves 'Spooky Action at a Distance' is Really Real", publisher: 'NIST（アメリカ国立標準技術研究所）', url: 'https://www.nist.gov/news-events/news/2015/11/nist-team-proves-spooky-action-distance-really-real', accessed: '2026-11-18', version: '2015年11月10日', note: '2015年のNISTの実験で検出器が184m離れ、乱数で装置の向きを選び、主な抜け穴をふさいだこと。' },
    { title: 'The Nobel Prize in Physics 2022', publisher: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/2022/summary/', accessed: '2026-11-18', note: '受賞者と受賞理由「for experiments with entangled photons, establishing the violation of Bell inequalities and pioneering quantum information science」。' },
    { title: 'What Is Quantum Entanglement?', publisher: 'Caltech Science Exchange（カリフォルニア工科大学）', url: 'https://scienceexchange.caltech.edu/topics/quantum-science-explained/entanglement', accessed: '2026-11-18', note: 'もつれた粒子が光より速く連絡し合っているというのはよくある誤解で、量子力学を使って光より速く通信することはできないこと。' },
    { title: 'Philosophical Issues in Quantum Theory', publisher: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/qt-issues/', accessed: '2026-11-18', note: '量子論が世界について何を語っているかについて、物理学者と哲学者の間で一致した見解がないこと、エヴェレットが1957年の博士論文で多世界解釈のもとになる考えを示したこと。' },
  ],
}

export default chapter
