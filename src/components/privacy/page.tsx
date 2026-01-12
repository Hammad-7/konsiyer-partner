import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        <Link 
          to="/"
          className="inline-flex items-center text-sm text-gray-700 hover:underline mb-6"
        >
          ← Ana Sayfaya Dön
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">
          Gizlilik Politikası, Aydınlatma Metni ve Kişisel Veri Korunması Bildirimi
        </h1>

        <div className="prose prose-sm max-w-none space-y-6">
          <p>
            <strong>www.alfreya.com</strong> ve Alfreya uygulaması (bundan sonra platform olarak anılacaktır) Konsiyer Teknoloji Anonim Şirketi'ne aittir (bundan sonra <strong>ALFREYA</strong> olarak anılacaktır) ve kişisel verilerin gizliliği ve güvenliği için ALFREYA'nin benimsediği ilkeler, işbu gizlilik politikasında düzenlenmiştir.
          </p>

          <p>
            Kullanıcı, ALFREYA tarafından sunulan hizmetlerden faydalandığında; bu gizlilik sözleşmesindeki esasları okuduğunu, kişisel verilerin gizliliği ve bütünlüğü ile ilgili konularda aydınlatıldığını, işbu gizlilik prosedürünün ihlali durumunda hukuki ve cezai sorumluluğun kullanıcıya ait olduğunu kabul etmiş sayılır.
          </p>

          <p>
            ALFREYA vasıtasıyla sunulan hizmetlerden yararlanan kullanıcıdan elde edilen bilgilerin ne şekilde kullanılacağı ve korunacağı, işbu "ALFREYA GİZLİLİK POLİTİKASI VE KİŞİSEL VERİLERİN KORUNMASI BİLDİRİMİ "nde belirtilen şartlara tabidir. Kullanıcı, ALFREYA'ye ait bir platformu ziyaret etmekle ve bu site vasıtasıyla sunulan hizmetlerden yararlanmayı talep etmekle işbu "Gizlilik Politikası, Aydınlatma Metni ve Kişisel Veri Korunması Bildirimi"nde belirtilen şartları kabul etmektedir.
          </p>

          <p>
            ALFREYA, kullanıcılar tarafından sağlanan gizli bilgileri kesinlikle özel ve gizli tutmayı, bunu bir sır olarak saklamayı taahhüt eder. Bu konuda gerekli tüm teknik, hukuki ve yönetimsel tedbirleri almayı ve üzerine düşen tüm özeni tam olarak göstermeyi işbu bildirimle taahhüt eder.
          </p>

          <p>
            ALFREYA, 13 yaşının altındaki kullanıcıları hedefleyen bir hizmet sunmamaktadır. Bu yaş grubundan bilerek kişisel veri toplanmaz veya işlenmez. 18 yaşın altındaki kullanıcılar, ALFREYA hizmetlerinden ancak bir ebeveyn ya da yasal vasi aracılığıyla yararlanabilir. Ebeveyn veya vasi olarak çocuğunuzun ALFREYA uygulamasını izinsiz olarak kullandığını ya da kişisel verilerini paylaştığını düşünüyorsanız, lütfen bizimle iletişime geçiniz. Gerekli durumlarda söz konusu veriler sistemlerimizden silinecektir.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">TOPLANAN KİŞİSEL VERİLER VE ELDE EDİLME YÖNTEMİ</h2>

          <p>
            İşbu gizlilik politikası kapsamında düzenlenen koşullar kapsamında aşağıdaki bilgiler, 'Kişisel Veri' olarak tanımlanmıştır. Kullanıcılar, üyelik girişi esnasında dijital ortamda alfreya.com'a aşağıdaki verileri sağlar.
          </p>

          <p>
            Kişisel veriler, Kullanıcının ALFREYA platformuna üyeliği ile açık rızası alınarak; ALFREYA platformu üzerinde gerçekleştirdiği dolaşma hareketleri çerez aracılığı ile otomatik ya da otomatik olmayan yollarla elektronik ortamda toplanabilmektedir.
            Kullanıcı, kayıt sırasında paylaşmış olduğu bilgileri, dileği zaman güncelleme, değiştirme ve silme hakkına sahiptir.
          </p>

          <p>Kişisel verileri ALFREYA platformları üzerinde kullanıcının açık rızası dahilinde kişisel olarak veya çerezler üzerinden anonim olarak toplanmaktadır:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Yaş, cinsiyet, bütçe tercihi, marka tercihleri, dolabındaki giysilerin görsel ve özellik bilgileri</li>
            <li>Kullanıcının gezinti tanımlama bilgileri (çerez, web tarayıcı işaretçileri-bilgileri, IP no-adresi, sisteme giriş, görüntülenme süresi, beacon bilgisi)</li>
            <li>Kullanıcının kişisel ilgi alanlarına ilişkin bilgileri, alışveriş tercihleri, demografik bilgileri</li>
            <li>Kullanıcıya ilave teklif ve hizmetler sunma amaçlı Çerezler üzerinden alfreya.com ve Alfreya uygulaması üzerinde gerçekleştirilen hareketler ve arama geçmişi</li>
          </ul>

          <p>
            Kullanıcı, alfreya.com'a üyelik veya hizmet alma sırasında sağladığı verilerin, bilgilerin doğruluğunu ve güncelliğini taahhüt etmiş sayılır. Kullanıcıdan istenen bilgilerin gerçeğe uygun olarak doldurulması ve ilerde değişiklik olması durumunda bilgilerin güncellenmesi gerekmektedir. Bu tür hassas bilgiler, yalnızca kimlik bilgilerinin doğruluğunu onaylamak için kullanılacak olup, bilgiler onaylandıktan sonra ALFREYA veri tabanında korunacaktır.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">VERİLERİN KULLANIM AMACI</h2>

          <p>
            ALFREYA, mevzuatın izin verdiği durumlarda ve ölçüde kullanıcıların kişisel bilgilerini kaydedebilecek, saklayabilecek, güncelleyebilecek, üçüncü kişilere açıklayabilecek, devredebilecek, sınıflandırabilecek ve işleyebilecektir. Toplanılan bilgilerin kullanım amacı aşağıdaki şekilde detaylandırılmıştır:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Kullanıcının kişisel verileri, üyelik kaydı ve hesabının oluşturulması ve buna ilişkin kayıtların tutulması</li>
            <li>Kullanıcıya doğru öneriler sunma ve alışveriş deneyimini zenginleştirme ve kişiselleştirme</li>
            <li>Soru, görüş ve önerilerin değerlendirilebilmesi, müşteri memnuniyet anketlerinin düzenlenmesi</li>
            <li>Veri tabanı oluşturarak, listeleme, raporlama, doğrulama, analiz ve değerlendirmeler yapmak, istatistiki bilgiler üretmek ve gerektiğinde hukuka uygun olarak bunları işin uzmanı üçüncü kişilerle paylaşma</li>
            <li>Platforma dahil olan satıcıların ALFREYA üzerinden kullanıcı ile iletişime geçebilmesi ve kullanıcılara reklam, tanıtım ve pazarlama faaliyetlerinde kullanabilmesine olanak tanıma</li>
            <li>Doğrudan pazarlama, yeniden pazarlama ve üçüncü taraf pazarlama platformlarında pazarlama faaliyetini gerçekleştirebilme</li>
            <li>KVKK'dan doğan yükümlülüklerimizi yerine getirebilmek ve mevzuattan doğan ALFREYA'nin haklarını kullanabilmesi</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">ÇEREZ POLİTİKASI</h2>

          <p>
            Çerez, ziyaret edilen bir web sitesi tarafından kullanıcının bilgisayarında depolanan bilgilerdir. Çerezlerin kullanım amacı; kullanıcının yaptığı tercihleri hatırlamak, platformun performansını arttırmak ve web sitesi/mobil uygulama kullanımını kişiselleştirmektir.
          </p>

          <p>
            Bu kullanım parola kaydeden ve web sitesi/mobil uygulama oturumunu sürekli açık kalmasını sağlayan, böylece her ziyarette birden fazla kez parola girilmesine gerek duymayan çerezleri ve web sitesi/mobil uygulamaya daha sonraki ziyaretlerde kullanıcıyı hatırlayan ve tanıyan çerezleri içerir.
          </p>

          <p>
            ALFREYA kendi platformunda yarattığı çerezlere ek olarak Google, Facebook gibi üçüncü taraflardan alınan hizmetler kapsamında kullanıcı deneyiminin iyileştirilmesi ve tercihlere uygun reklam faaliyetlerinde bulunmak için de çerez kullanmaktadır.
          </p>

          <p>
            Çerez kullanımı, kullanıcının tarayıcısının ayarlar kısmından kapatılabilmektedir. Kullanıcıların Çerez tercihlerini değiştirme imkânı her zaman saklıdır.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">İZİNLİ ELEKTRONİK İLETİ GÖNDERİMİ</h2>

          <p>
            Kullanıcı, üye olduğu esnada veya sonrasında "İletişim İzni"'ni kabul etmekle; ALFREYA ile paylaşılmasına rıza göstermiş olduğu kişisel verilerin, kullanıcıya çeşitli avantajların sağlanıp sunulabilmesi ve kullanıcıya özel reklam, satış, pazarlama, anket ve benzer amaçlı her türlü elektronik iletişim yapılması ve diğer iletişim mesajlarının gönderilmesi amacıyla; toplanmasına, saklanmasına, işlenmesine, kullanılmasına, aktarımına izin vermiş bulunmaktadır.
          </p>

          <p>
            Bunun yanında, bu bilgiler sadece kullanıcıya sağlanacak hizmetlerin kusursuz sunulabilmesi, olası gönderilerin sağlıklı şekilde teslim edilmesi, telefon, sms ve/veya e-posta yoluyla bildirimlerin zamanında ulaştırılabilmesi amacıyla; ALFREYA'nin sözleşme ilişkisi içinde olduğu, veri koruması ve güvenliği konusunda ALFREYA ile hukuken ve teknik olarak aynı sorumlulukları taşıyan, ilgili Mevzuat hükümlerine riayet eden 3. kişilerle, yalnızca ihtiyaç durumunda ve gerekli ölçüde paylaşılacaktır.
          </p>

          <p>
            Kullanıcının üyeliğin ayarlar kısmından iletişim izinlerini değiştirme veya kaldırma hakkı; 5809 sayılı Elektronik Haberleşme Kanunu ile güvenceye alınmıştır.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">KİŞİSEL VERİLERİN DEPOLANMASI VE KORUNMASI</h2>

          <p>
            Elde edilen kişisel veriler, yurtiçi veya yurtdışında ALFREYA'nin çalıştığı hizmet servis sağlayıcılarının tesisi bulunan başka bir ülkede ilgili mevzuat ve öngörülen güvenlik önlemleri dahilinde veriler aktarılabilir, depolanabilir, işlenebilir.
          </p>

          <p>
            Kişisel Veriler Kanunu uyarınca, elde edilen kişisel veriler ALFREYA tarafından, hukuka ve dürüstlük kuralına uygun, güncel, meşru amaçlar için, ölçülü ve ilgili mevzuata uygun sürelerle işlenebilir. Kişisel veriler, aşağıdaki hallerde ilgili kişinin rızası olmaksızın da işlenebilir:
          </p>

          <ol className="list-[lower-alpha] pl-6 space-y-2">
            <li>Kanunlarda açıkça öngörülmesi.</li>
            <li>Fiili imkânsızlık nedeniyle rızasını açıklayamayacak durumda bulunan veya rızasına hukuki geçerlilik tanınmayan kişinin kendisinin ya da bir başkasının hayatı veya beden bütünlüğünün korunması için zorunlu olması.</li>
            <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması.</li>
            <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması.</li>
            <li>İlgili kişinin kendisi tarafından alenileştirilmiş olması.</li>
            <li>Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması.</li>
            <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması.</li>
          </ol>

          <p>
            Kullanıcılar tarafından verilen/edinilen bilgilerin ve işlemlerin güvenliği için gerekli önlemler; bilgi ve işlemin mahiyetine göre ALFREYA sistemleri ve internet altyapısında, teknolojik imkanlar ve maliyet unsurları dahilinde, uygun teknik ve idari yöntemler ile alınmıştır.
          </p>

          <p>
            ALFREYA platformu kullanımlarında kredi kartı işlemi bulunmamaktadır. Tüm kredi kartı işlemleri ve onayları ALFREYA'den bağımsız olarak ilgili Banka veya Kart Kuruluşlarınca online olarak kullanıcı – satıcı arasında gerçekleştirilmekte olup Kredi kartı "numarası" ve "şifresi" gibi bilgiler ALFREYA tarafından görülmez ve kaydedilmez.
          </p>

          <p>
            ALFREYA platformuna üyelik ve bilgi güncelleme amaçlı girilen bilgiler diğer internet kullanıcıları tarafından görüntülenemez.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">YAPAY ZEKÂ KULLANIMI VE YURTDIŞINA AKTARIM</h2>

          <p>
            Alfreya platformunda sağlanan chatgpt ve/veya gemini yapay zekâ özellikleri kapsamında, tarafınızca yazılan serbest metinler, sorular, yanıtlara verdiğiniz geri bildirimler ve bu özelliklerin kullanımına ilişkin teknik kayıtlar ("AI Verileri"), hizmetin sunulması ve iyileştirilmesi amacıyla OpenAI, L.L.C. ve/veya Gemini bağlı hizmet sağlayıcıları tarafından işlenecek ve hukuka uygun şekilde aktarılabilecek. AI Verileri içinde istemeden yer verebileceğiniz kişisel veriler bulunabileceğinden, özel nitelikli kişisel verilerinizi (sağlık, biyometrik, din, sendika vb.) bu alanlara girmemenizi rica ederiz.
          </p>

          <p>
            AI Verilerinin işlenmesine ilişkin hukuki sebepler: (i) hizmetin sağlanması (KVKK m.5/2-c) ve meşru menfaatlerimiz (KVKK m.5/2-f) kapsamında zorunlu teknik kayıtlar; (ii) kişiselleştirilmiş içerik/öneri ve benzeri pazarlama amaçları ile yurtdışı aktarım için açık rızanız (KVKK m.5/1 ve m.9). Açık rıza vermemeniz, temel hizmetlerden yararlanmanızı engellemez; ancak AI tabanlı gelişmiş işlevler kısmen/devre dışı kalabilir.
          </p>

          <p>
            Veriler, mümkün olduğu ölçüde takma adlaştırma/maskeleme, şifreleme, erişim kontrolü ve sızma testleri gibi teknik ve idari tedbirlerle korunur. AI Verileri, talimatlarımız uyarınca model eğitimi amacıyla kullanılmamakta ve yalnızca hizmetin sağlanması/iyileştirilmesi için işlenmektedir. Saklama süreleri amaçla sınırlıdır; yasal yükümlülükler ve uyuşmazlık zamanaşımı saklıdır.
          </p>

          <p>
            KVKK m.11 kapsamındaki haklarınızı (erişim, düzeltme, silme, aktarıma itiraz vb.) her zaman kullanabilirsiniz. Açık rızanızı dilediğiniz anda profilinizdeki tercih merkezinden veya info@alfreya.com üzerinden geri çekebilirsiniz; geri çekme, ileriye dönük sonuç doğurur.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">VERİLERE ERİŞİMİ OLANLAR</h2>

          <p>
            Kullanıcıların, ALFREYA'e ilettiği her tür bireysel ve kurumsal veri, işbu sözleşmede belirlenen amaçlar ve hizmet ifası için gereken zorunlu haller haricinde üçüncü kişilere açıklanmayacaktır. Zorunlu haller, kullanım koşullarında yer alan hizmetlerin ifası kapsamında; kullanıcı gizlilik ve güvenliğinin sağlanması, hata ve sorunların giderilmesi, hizmetlerin iyileştirilmesi, kullanıcı bilgilerinin doğrulanması, hizmet ifası için yapılması gereken araştırma ve değerlendirmelerdir. Bu amaçlarla ALFREYA'nin iş birliği içinde olduğu üçüncü kişi ve kurumlarla, sözleşme konusu faaliyetler kapsamında ve yasaya uygun şekilde bu veriler paylaşılabilir, yurtiçi ve yurtdışında üçüncü kişilere aktarılabilir.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">KULLANICI HAKLARI VE VERİLERE ERİŞİM HAKKI</h2>

          <p>Kullanıcı, ALFREYA'e başvurarak kendisiyle ilgili:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel veri işlenip işlenmediğini öğrenme, işlenmişse buna dair bilgi talebinde bulunma</li>
            <li>Kişisel verilerin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
            <li>İlgili mevzuata göre kişisel verilerin silinmesini veya yok edilmesini isteme</li>
            <li>İlgili mevzuata göre düzeltme, silme ve yok edilme işlemlerinin, bu verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi nedeniyle zarara uğranması halinde zararın giderilmesini talep etme haklarına sahiptir</li>
          </ul>

          <p>
            Kullanıcı, yukarıda belirtilen taleplerini "<strong>Atatürk Mah. Ertuğrul Gazi Sk. Metropol İstanbul Sitesi C1 Blok No: 2B İç Kapı No: 376 Ataşehir / İstanbul</strong>" adresine yazılı olarak iletebilecektir. ALFREYA, izah edilen talepler uyarınca, gerekçeli olumlu/olumsuz yanıtını, yazılı veya dijital ortamdan gerçekleştirebilir.
          </p>

          <p>
            Taleplere ilişkin gerekli işlemlerin ücretsiz olması esastır. Ancak işlemlerin bir maliyet gerektirmesi halinde, ALFREYA, ücret talebinde bulunma hakkını saklı tutar. Bu ücretler, Kişisel Verilerin Korunması Kurulu tarafından, Kişisel Verilerin korunması Kanunu'nun 13. maddesine göre belirlenen tarife üzerinden belirlenir. Söz konusu haklarla ilgili iletişim, kişisel veri sahipleri tarafından 6698 sayılı Kanun Kapsamında 30 (otuz) gün içerisinde değerlendirilerek sonuçlandırılacaktır.
          </p>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <h2 className="text-lg font-bold mb-4">
              İletişim
            </h2>
            <p className="text-sm text-gray-600">
              <strong>Konsiyer Teknoloji Anonim Şirketi</strong><br />
              Mersis No: 0576119170800001<br />
              Atatürk Mah. Ertuğrul Gazi Sk. Metropol İstanbul Sitesi C1 Blok No: 2B İç Kapı No: 376 Ataşehir / İstanbul<br />
              E-posta: <a href="mailto:info@alfreya.com" className="text-blue-600 hover:underline">info@alfreya.com</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
