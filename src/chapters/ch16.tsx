import type { Chapter } from '../content/types'
import { Callout, ChapterLink, FigRef, Ref, Term } from '../components/content'
import { Level, Who } from '../components/history'
import { FigApparatus, FigBars, FigContraction, FigEtherWind, FigInterferometer, FigMedium, FigRiver, FigRoad16, FigRotate, FigShip } from '../figures/ch16'

const chapter: Chapter = {
  key: '16',
  part: 'p4',
  title: '光を伝えるものとマイケルソン・モーリーの実験',
  summary:
    '19世紀の物理学者は、光の波を伝えるエーテルが空間を満たしていると考えました。1887年、マイケルソンとモーリーは、エーテルに対する地球の動きを干渉計で調べましたが、予想された縞のずれは見つかりませんでした。',
  goals: [
    '19世紀の物理学者が、光を伝えるエーテルがあると考えた理由を説明できる',
    'エーテルに対して地球が動いていれば、光が往復する時間が向きによって変わるはずだという予想を、川を往復する船の例で説明できる',
    '干渉計のしくみと、1887年のマイケルソンとモーリーの実験の結果を説明できる',
    'ローレンツとポアンカレがこの結果をどう説明しようとし、それが特殊相対性理論にどうつながったかを説明できる',
  ],
  prerequisites: ['7', '9'],
  people: ['michelson', 'lorentz', 'poincare', 'einstein', 'maxwell', 'galileo'],
  events: [
    { year: 1881, title: 'マイケルソンの干渉計', note: 'マイケルソンが干渉計を作り、エーテルに対する地球の動きを調べたが、縞のずれは見られなかった。', people: ['michelson'], section: 'interferometer' },
    { year: 1887, title: 'マイケルソン・モーリー', note: 'マイケルソンとモーリーが精度を上げた干渉計で実験し、予想された縞のずれの40分の1程度より小さいずれしか見られなかった。', people: ['michelson'], section: 'result' },
    { year: 1892, title: 'ローレンツの縮みの考え', note: 'ローレンツが、物体はエーテルの中を進む向きにわずかに縮むという考えで、実験の結果を説明した（1889年にフィッツジェラルドも同じ考えを示していた）。', people: ['lorentz'], section: 'lorentz' },
    { year: 1904, yearLabel: '1899〜1905年', title: 'ローレンツ変換', note: 'ローレンツが位置と時刻を書き換える規則を示して完成させ、ポアンカレが1905年にローレンツ変換と名付けた。', people: ['lorentz', 'poincare'], section: 'lorentz' },
  ],
  sections: [
    {
      id: 'ether',
      title: 'エーテルという考え',
      body: (
        <>
          <p>
            第4部では相対性理論を扱います。この章ではその出発点になった実験を見ます。<ChapterLink n="17" />では、光の速さはだれから見ても同じだという考えから、時間の進み方や物の長さが見る人によって変わることを導いた理論を扱います。<ChapterLink n="18" />では時間と空間を合わせて考える見方と、質量とエネルギーが互いに移り変わることを、<ChapterLink n="19" />では重力を時間と空間の曲がりとして説明する理論を、<ChapterLink n="20" />ではその理論を確かめた観測を扱います。
          </p>
          <p>
            19世紀の半ばには、光は波だと考えられていました（<ChapterLink n="7" />）。水面の波は水が揺れて伝わり、音は空気が揺れて伝わります。ところが、空気を抜いた容器の中で鳴らしたベルの音は外に聞こえないのに、光は容器を通り抜けます。星の光も空気のない宇宙空間を越えて届きます。そこで、何もないように見える空間も、光を伝える何かで満たされていると考えられました。これを
            <Term def="19世紀に、光の波を伝えると考えられた目に見えない媒質。宇宙空間を含むすべての空間と物の中を満たしているとされた。現在の物理学では、その存在を考える必要はないとされている。" en="ether">
              エーテル
            </Term>
            といいます。薬品のエーテルとは別のものです
            <Ref n={2} />。
          </p>
          <FigMedium />
          <p>
            <FigRef n="16-1" />
            はこの考え方を並べたものです。<Who id="maxwell">ジェームズ・クラーク・マクスウェル</Who>
            は1878年、百科事典『ブリタニカ』第9版の「エーテル」の項目で、空気は光のように横に揺れる波を伝えられないので、光を伝えるものは空気とは別のもので、透明な物の中にも入り込んでいると書きました
            <Ref n={2} />。マクスウェルは、このエーテルが電気と磁気の力も伝えると考えていました（<ChapterLink n="9" />）。
          </p>
          <p>
            説明がついていなかったのは、地球がこのエーテルの中を動いているかどうかでした。フランスのフレネルは、エーテルは止まっていて、地球はその中を通り抜けていると考えました。1851年にフランスのフィゾーが行った、流れる水の中の光の速さの実験も、この考えに合っていました
            <Ref n={2} />
            <Ref n={5} />。エーテルが止まっているなら、<FigRef n="16-2" />
            のように、地球から見るとエーテルは地球の進む向きと逆向きに流れていきます。風のない日でも、走る車の窓から手を出すと向かい風を受けるのと同じです。
          </p>
          <FigEtherWind />
        </>
      ),
    },
    {
      id: 'expected',
      title: '地球が動けば光の速さが変わるはず',
      body: (
        <>
          <p>
            動いている乗り物の中で物がどう動くかは、<Who id="galileo">ガリレオ・ガリレイ</Who>
            が1632年の『天文対話』で論じていました。大きな船の甲板の下の部屋に、チョウと、しずくを落とす容器を持ち込みます。船が揺れずに一定の速さで進んでいれば、チョウはどの向きにも同じように飛び、しずくは真下の器に落ちます。部屋の中で起こることからは、船が止まっているか動いているかを区別できない、とガリレオは書きました
            <Ref n={1} />。この考えを
            <Term def="一定の速さでまっすぐ進む船や乗り物の中では、物の運動が止まっているときと同じように起こり、中で起こることからは自分が動いているかどうかを区別できないという原理。ガリレオが1632年の『天文対話』で船の例を使って説明した。" en="Galilean principle of relativity">
              ガリレイの相対性原理
            </Term>
            といいます。
          </p>
          <FigShip />
          <p>
            <FigRef n="16-3" />
            の右のように、岸から見ると、しずくは船と一緒に前へ進みながら落ちます。速さは見る人によって足し引きされ、秒速5mで進む船の上で前へ秒速10mでボールを投げると、岸から見たボールの速さは秒速15mです。
          </p>
          <p>
            光に同じ考えを当てはめると、エーテルに対して地球が動いていれば、地球の上で測る光の速さは向きによって変わるはずです。地球は太陽のまわりを秒速約30kmで回っています
            <Ref n={3} />。光の速さ（秒速約30万km）の1万分の1です
            <Ref n={4} />。地球の進む向きに出た光は、地球から見ると秒速30kmだけ遅く進むことになります。
          </p>
          <p>
            ただし、地上で光の速さを測る方法は、フィゾーの実験（<ChapterLink n="7" />）のように光を鏡で往復させるものでした。往きに遅れた分の多くを、帰りに取り戻してしまいます。マクスウェルは『ブリタニカ』の項目で、往復の時間の増え方は全体の1億分の1ほどで、感じ取れないと書きました
            <Ref n={2} />。
          </p>
          <FigRiver />
          <p>
            それでも、わずかな違いは残ります。<FigRef n="16-4" />
            では、流れが秒速3mの川で、水に対して秒速5mで進む2そうの船が、400m先まで行って戻ります。流れのない水なら160秒の往復に、流れに沿う船は250秒、流れを横切る船は200秒かかります。横切る船は流されないように少し上流へ向けて進むので、横切る向きの速さが秒速4mに落ちるからです。船を光に、川の流れをエーテルの流れに置き換えると、地球の進む向きとそれに直角な向きでは、光の往復の時間がわずかに違うはずです。
          </p>
        </>
      ),
    },
    {
      id: 'interferometer',
      title: '干渉計（1881年、1887年）',
      body: (
        <>
          <p>
            この違いを測ろうとしたのが、<Who id="michelson">アルバート・マイケルソン</Who>
            です。アメリカの海軍兵学校で物理を教えていたマイケルソンは、1870年代の終わりに光の速さをそれまでより精密に測りました
            <Ref n={6} />。1881年の論文では、マクスウェルの見積もりを紹介したうえで、光の波長を物差しに使えばこの小さな差も測れると書きました
            <Ref n={4} />。そのために作った装置が
            <Term def="光を2つに分けて別々の道を通らせ、もう一度重ねて干渉させる装置。2つの道の長さや、光が通るのにかかる時間のわずかな違いを、明暗の縞の位置のずれとして測ることができる。" en="interferometer">
              干渉計
            </Term>
            です。<FigRef n="16-5" />
            のように、光源からの光を斜めに置いたガラス板に当てると、一部は板を通り抜けて鏡Aへ、残りは直角に反射して鏡Bへ進みます。2つの光は鏡で跳ね返って板の所で再び重なり、望遠鏡に入ります。重なった光は干渉し（<ChapterLink n="7" />）、明るい縞と暗い縞をつくります。2つの道の長さの差が波長の半分だけ変わると、明るい所と暗い所が入れ替わります。黄色い光の波長は約1万分の6mmなので、これよりずっと小さい違いも縞のずれとして見えます
            <Ref n={4} />。
          </p>
          <FigInterferometer />
          <p>
            1881年の実験の装置は振動に弱く、ベルリンの研究所からポツダムの天体物理観測所の地下室に移しても、約100m離れた道で地面を踏みつけただけで縞が消えました。腕の長さは約1.2mで、費用はアメリカの発明家グラハム・ベルが出しました
            <Ref n={4} />。マイケルソンは縞のずれは見られなかったとまとめ、止まったエーテルという考えは誤りだと結論しました。しかし計算には見落としがあり、1881年の冬にフランスのポティエが、1886年にオランダのローレンツが指摘しました。直すと予想されるずれは半分になり、実験の誤差とほとんど変わらなくなりました
            <Ref n={5} />。
          </p>
          <p>
            クリーブランドのケース応用科学校の教授になったマイケルソンは、化学者のエドワード・モーリーと実験をやり直しました
            <Ref n={6} />。<FigRef n="16-6" />
            のように、約1.5m四方、厚さ約30cmの石の板を、水銀に浮かべた輪の形の木の台に載せ、振動を抑えながら、ゆがませずにゆっくり回せるようにしました。板の四隅の鏡で光を何度も反射させ、光の道を約11mと、1881年の約10倍にしました
            <Ref n={5} />。
          </p>
          <FigApparatus />
        </>
      ),
    },
    {
      id: 'result',
      title: '結果が予想と違った',
      body: (
        <>
          <p>
            観測は1887年7月8日から12日にかけて、正午ごろと夕方6時ごろに行われました。地球の公転の速さだけを考えると、装置を90度回したときの縞のずれは、縞の間隔の0.4ほどになるはずでした。実際のずれは確実にその20分の1より小さく、おそらく40分の1より小さいものでした
            <Ref n={5} />。
          </p>
          <FigRotate />
          <p>
            <FigRef n="16-7" />
            では、望遠鏡で見えるはずだった縞の動きと実際の結果を、「表示」を切り替えて比べられます。<FigRef n="16-8" />
            はずれの大きさを棒の長さで比べたものです。1887年の装置では予想されるずれが1881年の20倍になりましたが、それでもずれは見られませんでした。
          </p>
          <FigBars />
          <p>
            2人は、この結果はエーテルが止まっているというフレネルの説明を否定するのに十分だと書いています。一方、地球がまわりのエーテルを引きずって動いているというイギリスのストークスの考えには、ローレンツが無理があることを示していました
            <Ref n={5} />。フィゾーの実験とマイケルソンとモーリーの実験を、同時に説明できる考えがなくなりました。2人は実験を失敗だと考え、その後もエーテルがあると信じ続けました
            <Ref n={6} />。
          </p>
        </>
      ),
    },
    {
      id: 'lorentz',
      title: 'ローレンツとポアンカレの説明',
      body: (
        <>
          <p>
            この問題に取り組んだ一人が、オランダの物理学者<Who id="lorentz">ヘンドリック・ローレンツ</Who>
            です。<ChapterLink n="5" />の気象学者エドワード・ローレンツとは別の人で、つづりも Lorentz と Lorenz で違います。
          </p>
          <p>
            1889年、アイルランドの物理学者フィッツジェラルドは、アメリカの雑誌『サイエンス』への短い手紙で、物体の長さはエーテルの中を進む向きと横切る向きで変わるという考えを示しました
            <Ref n={7} />。ローレンツは1892年、この手紙を知らないまま同じ考えを発表し、のちにフィッツジェラルドが先だったと認めています
            <Ref n={12} />。進む向きの腕が2億分の1だけ縮めば、往復の時間の差が打ち消され、縞はずれません。地球の直径なら約6cmの縮みです。物差しも同じように縮むので、物差しを当てても縮みに気づくことはできません
            <Ref n={8} />。<FigRef n="16-9" />
            はこの考えを、縮みを大きく描いて示したものです。
          </p>
          <FigContraction />
          <p>
            ローレンツはさらに、エーテルに対して動いている物の中の電気と光の現象を、止まっている物の現象に書き換える方法を探しました。その計算では場所ごとに少しずつずれた時刻を使うと都合がよく、ローレンツはこれを「局所時」と呼びました
            <Ref n={9} />。位置と時刻をこのように書き換える規則を
            <Term def="止まっている人と、一定の速さで動いている人のあいだで、出来事の位置と時刻の値を書き換える規則。光の速さがどちらから見ても同じになるように、時刻も書き換えるところが、ニュートンの力学での書き換えと違う。" en="Lorentz transformation">
              ローレンツ変換
            </Term>
            といいます。ローレンツは1899年の論文で、一部の値を決めないまま残した形でこの規則を示し、1904年の論文で完全な形にしました
            <Ref n={9} />
            <Ref n={12} />。資料によってローレンツ変換の年が1899年とも1904年とも書かれるのはこのためです。この規則の意味は<ChapterLink n="17" />で説明します。
          </p>
          <p>
            フランスの数学者<Who id="poincare">アンリ・ポアンカレ</Who>
            は、ローレンツの説明が、新しい実験の結果が出るたびに仮定を付け足すものになっていると批判しました
            <Ref n={9} />。ポアンカレは1904年のアメリカのセントルイスでの講演で、止まっている人にも一定の速さで動いている人にも物理法則は同じで、自分が動いているかどうかを知る方法はないという「相対性原理」を論じました。ガリレイの相対性原理を、光や電気と磁気の現象にも広げる考えです。同じ講演では、離れた2人が光の信号で合わせた時計は、2人がそろって動いていれば局所時を示すが、2人ともそれに気づけないと説明しました
            <Ref n={10} />。1905年6月5日に発表した論文では、この書き換えの規則をローレンツの名で呼び、地球の絶対的な動きを示せないことは自然の一般的な法則であるらしいと書きました
            <Ref n={11} />。
          </p>
          <FigRoad16 />
          <p>
            <FigRef n="16-10" />
            はここまでの年表です。ローレンツはエーテルという考えを捨てず、1913年の講演でも、エーテルがある程度の実体を持つという古い解釈に満足を感じると述べています
            <Ref n={12} />。
          </p>
          <p>
            1905年6月30日、<Who id="einstein">アルベルト・アインシュタイン</Who>
            の論文が雑誌に届きました
            <Ref n={12} />。アインシュタインは相対性原理と、光の速さは光を出す物の動きによらないという原理から出発し、エーテルを考える必要はないとしました。この理論は特殊相対性理論と呼ばれ、<ChapterLink n="17" />で扱います。論文の初めには、「光の媒質」に対する地球の動きを確かめる試みがうまくいかなかったことが書かれていますが、マイケルソンとモーリーの名前はありません
            <Ref n={13} />。
          </p>
          <Callout kind="evidence" title="アインシュタインとこの実験">
            <p>
              アインシュタインが1905年より前にこの実験をいつ知り、どれほど重く見ていたかについては、本人の後年の発言が食い違い、研究者の見方も分かれています
              <Ref n={6} />
              <Ref n={14} />。1901年の友人あての手紙では、エーテルに対する物の動きを干渉で調べる方法をまだ考えていました
              <Ref n={14} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'after',
      title: 'その後の展開',
      body: (
        <>
          <p>
            マイケルソンは1907年にノーベル物理学賞を受けました。受賞の理由は「精密な光学機器と、それを使った分光学と計測の研究」で、エーテルの実験は挙げられていません
            <Ref n={15} />。干渉計はメートルの長さを光の波長で測り直すことや、1920年に星の見かけの大きさを初めて測ることにも使われました
            <Ref n={6} />。
          </p>
          <p>
            光の速さが向きによって違うかを調べる実験は、その後も精度を上げて繰り返されました。2009年に発表されたドイツの研究チームの実験では、直角に組んだ2つの装置の中で光を往復させながら1年にわたって回し続け、向きによる光の速さの違いは、あっても10京分の1程度より小さいことを示しました
            <Ref n={16} />
            <Level of="confirmed" />。
          </p>
          <p>
            重力波（時間と空間のゆがみが波として伝わる現象。<ChapterLink n="36" />）をとらえるアメリカの LIGO の検出器も、マイケルソンの干渉計をより複雑にした装置で、L字形に組んだ長さ4kmの腕を持ちます
            <Ref n={17} />
            <Ref n={18} />。
          </p>
          <p>
            特殊相対性理論が受け入れられると、光の波を伝える媒質を考える必要はなくなりました。光は電場と磁場の揺れが伝わる電磁波で（<ChapterLink n="9" />）、何もない空間を伝わります。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章の要点',
      body: (
        <ul>
          <li>19世紀の物理学者は光の波を伝えるものとして、すべての空間を満たすエーテルを想定した。</li>
          <li>エーテルが止まっていれば、地球の上では光の速さが向きによって変わるはずだったが、往復の時間の差は1億分の1ほどだった。</li>
          <li>マイケルソンは1881年、光を2つに分けて重ねる干渉計で、この差を縞のずれとして測ろうとした。</li>
          <li>1887年のマイケルソンとモーリーの実験では、縞のずれは予想の40分の1程度より小さかった。2人はエーテルを信じ続けた。</li>
          <li>フィッツジェラルドとローレンツは、物体が進む向きにわずかに縮むと考えた。ローレンツは位置と時刻を書き換える規則（ローレンツ変換）を示し、ポアンカレは相対性原理を論じた。</li>
          <li>1905年、アインシュタインはエーテルを考えない理論を発表した。この実験をどの程度意識していたかには、見方が分かれている。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Dialogo sopra i due massimi sistemi del mondo tolemaico e copernicano / Giornata seconda', publisher: 'Galileo Galilei（Wikisource イタリア語版による原文）', url: 'https://it.wikisource.org/wiki/Dialogo_sopra_i_due_massimi_sistemi_del_mondo_tolemaico_e_copernicano/Giornata_seconda', accessed: '2026-11-18', version: '1632年', note: '『天文対話』第2日の、船の甲板の下の部屋でチョウ、魚、しずく、跳ぶ人を観察する例。船が揺れずに一定の速さで進めば、止まっているか動いているかを区別できないこと。' },
    { title: 'Ether（Encyclopædia Britannica, Ninth Edition, Volume VIII）', publisher: 'James Clerk Maxwell（Wikisource による原文の写し）', url: 'https://en.wikisource.org/wiki/Encyclop%C3%A6dia_Britannica,_Ninth_Edition/Ether_(2.)', accessed: '2026-11-18', version: '1878年、568〜572ページ', note: 'エーテルは見かけ上何もない空間にあると考えられた物質であること、空気は横波を伝えないので光を伝えるものは空気と別だとしたこと、往復の時間の増え方は1億分の1ほどで感じ取れないこと、フィゾーの流れる水の実験がフレネルの説に合うこと。同じ巻に化学のエーテルの項目が別にある。' },
    { title: 'Earth Fact Sheet', publisher: 'NASA Space Science Data Coordinated Archive', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', accessed: '2026-11-18', note: '地球の公転の平均の速さが秒速29.78kmであること。' },
    { title: 'The Relative Motion of the Earth and the Luminiferous Ether', publisher: 'A. A. Michelson、American Journal of Science 第3集22巻（Wikisource による原文の写し）', url: 'https://en.wikisource.org/wiki/The_Relative_Motion_of_the_Earth_and_the_Luminiferous_Ether', accessed: '2026-11-18', version: '1881年、120〜129ページ', note: 'マクスウェルの手紙の紹介と、黄色い光の波長を物差しにすれば測れるという主張。地球の速さは光の速さの約1万分の1、腕の長さ1200mm（200万波長）。ベルリンの研究所からポツダムの観測所の地下へ移したこと、約100m先の道を踏むと縞が消えたこと、ベルの資金、止まったエーテルの仮説は誤りという結論。' },
    { title: 'On the Relative Motion of the Earth and the Luminiferous Ether', publisher: 'A. A. Michelson、E. W. Morley、American Journal of Science 第3集34巻（Wikisource による原文の写し）', url: 'https://en.wikisource.org/wiki/On_the_Relative_Motion_of_the_Earth_and_the_Luminiferous_Ether', accessed: '2026-11-18', version: '1887年11月、333〜345ページ', note: 'フレネルの仮説とフィゾーの実験、1881年の計算の見落としとポティエとローレンツの指摘、石の板（約1.5m四方、厚さ0.3m）と水銀の上の浮き、光の道約11m、6分で1回転と16の印、観測日、予想0.4縞に対し実際は確実に20分の1未満・おそらく40分の1未満、相対速度の上限、3か月ごとの再実験の予定、山の上での実験の提案。' },
    { title: 'This Month in Physics History: November 1887: Michelson and Morley report their failure to detect the luminiferous ether', publisher: 'APS News 2007年11月号（アメリカ物理学会）', url: 'https://www.aps.org/apsnews/2007/11/november-1887-michelson-uminiferous-ether', accessed: '2026-11-18', note: 'マイケルソンの生い立ちと光の速さの測定、ケース応用科学校で化学者モーリーと組んだこと、2人が実験を失敗と考えエーテルを信じ続けたこと、アインシュタインが影響を受けたかは不確かなこと、メートルの測定と1920年の星の視直径の測定。ケースに移った年を1882年としているが、ノーベル財団の伝記は1883年としているため、本文では年を書かなかった。' },
    { title: 'The Ether and the Earth’s Atmosphere', publisher: 'G. F. FitzGerald、Science 13巻（Wikisource による原文の写し）', url: 'https://en.wikisource.org/wiki/The_Ether_and_the_Earth%27s_Atmosphere', accessed: '2026-11-18', version: '1889年、390ページ', note: '物体の長さがエーテルの中を進む向きか横切る向きかで変わるという仮説と、分子の間の力が動きの影響を受けるという理由。' },
    { title: 'The Relative Motion of the Earth and the Aether（英訳）', publisher: 'H. A. Lorentz、Verslagen der Zittingen der Wis- en Natuurkundige Afdeeling der Koninklijke Akademie van Wetenschappen 1巻（Wikisource による英訳）', url: 'https://en.wikisource.org/wiki/Translation:The_Relative_Motion_of_the_Earth_and_the_Aether', accessed: '2026-11-18', version: '1892年、74ページ', note: '進む向きの長さが2億分の1縮めば実験の結果が説明できること、地球の直径なら6cm、物差しも同じように縮むので比べて確かめることはできないこと、分子の間の力からの説明。' },
    { title: 'Electromagnetic phenomena in a system moving with any velocity smaller than that of light', publisher: 'H. A. Lorentz、Proceedings of the Royal Netherlands Academy of Arts and Sciences 6巻（Wikisource による原文の写し）', url: 'https://en.wikisource.org/wiki/Electromagnetic_phenomena', accessed: '2026-11-18', version: '1904年、809〜831ページ', note: '局所時の呼び名、新しい事実のたびに新しい仮説が必要になるというポアンカレの批判の紹介、以前に局所時と呼んだものとの関係（変換を完全な形にしたこと）。1899年の論文（同誌1巻427〜442ページ）では係数の一部を決めないまま残していたことも原文で確かめた。' },
    { title: 'The Value of Science, Chapter 8: The Present Crisis of Mathematical Physics', publisher: 'Henri Poincaré（Wikisource による英訳）', url: 'https://en.wikisource.org/wiki/The_Foundations_of_Science/The_Value_of_Science/Chapter_8', accessed: '2026-11-18', version: '1904年のセントルイスでの講演をもとにした章（『科学の価値』1905年）', note: '相対性原理の説明、エーテルに対する地球の速さを測る試みがすべて否定的な結果だったこと、光の信号で時計を合わせると局所時を示すという説明。' },
    { title: 'On the Dynamics of the Electron（6月の短報の英訳）', publisher: 'Henri Poincaré、Comptes Rendus 140巻（Wikisource による英訳）', url: 'https://en.wikisource.org/wiki/Translation:On_the_Dynamics_of_the_Electron_(June)', accessed: '2026-11-18', version: '1905年6月5日の会合、1504〜1508ページ', note: '地球の絶対的な動きを示せないことは自然の一般的な法則らしいという記述、ローレンツの1904年の論文の紹介、変換をローレンツの名で呼んだこと。' },
    { title: 'Special relativity', publisher: 'MacTutor History of Mathematics（セント・アンドルーズ大学）', url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Special_relativity/', accessed: '2026-11-18', note: 'フィッツジェラルドとローレンツの縮みの考えの関係（ローレンツがのちにフィッツジェラルドの先行を認めたこと）、ローレンツが1899年の論文で変換を書いたこと、アインシュタインの論文が1905年6月30日に届いたこと、ローレンツの1913年の講演。同じサイトのローレンツの伝記は変換の年を1904年としている。' },
    { title: 'On the Electrodynamics of Moving Bodies', publisher: 'A. Einstein（Wikisource による英訳、1920年版）', url: 'https://en.wikisource.org/wiki/On_the_Electrodynamics_of_Moving_Bodies_(1920_edition)', accessed: '2026-11-18', version: '原論文は1905年、Annalen der Physik 17巻', note: '「光の媒質」に対する地球の動きを確かめる試みが失敗したことへの言及（マイケルソンとモーリーの名はない）、相対性原理と光の速さについての2つの原理、エーテルが不要になること。' },
    { title: 'How Did Einstein Discover Special Relativity?', publisher: 'John Stachel、American Institute of Physics（展示「Einstein: Image and Impact」）', url: 'https://history.aip.org/exhibits/einstein/essay-einstein-relativity.htm', accessed: '2026-11-18', note: 'マイケルソンとモーリーの実験を事前に知っていたかなどについてのアインシュタインの後年の答えが、いつも一貫しているわけではないこと。1901年の友人への手紙で、エーテルに対する物の動きを干渉の実験で調べる方法を考えていたこと。' },
    { title: 'Albert A. Michelson – Facts', publisher: 'NobelPrize.org（ノーベル財団）', url: 'https://www.nobelprize.org/prizes/physics/1907/michelson/facts/', accessed: '2026-11-18', note: '1907年のノーベル物理学賞の受賞理由（精密な光学機器と、それを使った分光学と計測の研究）と、干渉計のしくみ。' },
    { title: 'Rotating optical cavity experiment testing Lorentz invariance at the 10^-17 level', publisher: 'S. Herrmann ほか、Physical Review D 80巻（arXiv:1002.1284 の要旨）', url: 'https://arxiv.org/abs/1002.1284', accessed: '2026-11-18', version: '2009年、105011', note: '直角に組んだ2つの光共振器を回し続け、1年分のデータから、光の速さの向きによる違いを約10京分の1（1×10のマイナス17乗）以下と示したこと。' },
    { title: 'What is an Interferometer?', publisher: 'LIGO Laboratory（カリフォルニア工科大学）', url: 'https://www.ligo.caltech.edu/page/what-is-interferometer', accessed: '2026-11-18', note: 'LIGO の装置がマイケルソンの干渉計をより複雑にしたもので、はたらきはよく似ていること。' },
    { title: 'Facts', publisher: 'LIGO Laboratory（カリフォルニア工科大学）', url: 'https://www.ligo.caltech.edu/page/facts', accessed: '2026-11-18', note: 'LIGO の検出器が、長さ4kmの真空の管を持つL字形の2台からなること。' },
  ],
}

export default chapter
