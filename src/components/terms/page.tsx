import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

export default function TermsPage() {
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
          Kullanıcı Sözleşmesi
        </h1>

        <div className="prose prose-sm max-w-none space-y-6">
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Tanımlar</h2>

          <p>
            <strong>konsiyer.com:</strong> Konsiyer Teknoloji Anonim Şirketi (Mersis No: 0576119170800001)<br />
            Atatürk Mah. Ertuğrul Gazi Sk. Metropol İstanbul Sitesi C1 Blok No: 2B İç Kapı No: 376 Ataşehir / İstanbul<br />
            E-posta: <a href="mailto:info@alfreya.com" className="text-blue-600 hover:underline">info@alfreya.com</a>
          </p>

          <p>
            <strong>Kullanıcı:</strong> İnternet yoluyla veya mobil olarak alfreya.com hizmetlerine erişen, bilgilerini kullanan ve paylaşan, bu bilgilere dayalı olarak işlem yapan gerçek kişilerdir.
          </p>

          <p>
            <strong>Site:</strong> www.alfreya.com isimli alan adından, bu alan adına bağlı alt alan adlarından oluşan web sitesi ve mobil platformdaki varlığı.
          </p>

          <p>
            <strong>Satıcı:</strong> Satıcıların kendi internet sitelerinde satışa sunduğu mal ve ürünler hakkındaki açıklayıcı bilgilerin ve satış koşullarının Site üzerinden Kullanıcı'lara görseller halinde sunulmasını sağlamak amacıyla alfreya.com ile İş birliği Sözleşmesi'ni onaylayan gerçek ve/veya tüzel kişi.
          </p>

          <p>
            <strong>alfreya.com Hizmetleri (Kısaca "Hizmet"):</strong> Kullanıcı'ların Kullanım Sözleşmesi'nde tanımlı olan iş ve işlemlerini gerçekleştirmelerini sağlamak amacıyla, alfreya.com tarafından Site içerisinde ortaya konulan uygulamalar.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Taraflar</h2>

          <p>
            İşbu sözleşme ve sözleşmeyle atıfta bulunulan ve sözleşmenin ayrılmaz birer parçası olan eklerden (EK–1 Güvenlik ve Gizlilik Politikası) oluşan işbu alfreya.com Kullanım Sözleşmesi (bundan böyle "Kullanım Sözleşmesi" olarak anılacaktır) ile alfreya.com sitesine işbu Kullanım Sözleşmesi'nde belirtilen koşullar dahilinde alfreya.com hizmetlerinden yararlanan Kullanıcı'lar arasında, Kullanıcı'nın elektronik olarak onay vermesi ile karşılıklı olarak kabul edilerek ve 4. maddedeki şartlara bağlı olarak yürürlüğe girmiştir.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Sözleşmenin Konusu ve Kapsamı</h2>

          <p>
            Kullanım Sözleşmesi'nin konusu, Site'de sunulan Hizmet'lerin, bu Hizmet'lerden yararlanma şartlarının ve tarafların hak ve yükümlülüklerinin tespitidir. Kullanım Sözleşmesi'nin hükümlerini kabul etmekle, Site içinde yer alan, kullanım kurallarını ve Hizmet'lere ilişkin olarak alfreya.com tarafından açıklanan her türlü usul, kural ve beyanı da kabul etmiş olmaktadır. Kullanıcı, bahsi geçen usul, kural ve beyanlarda belirtilen her türlü hususa uygun olarak davranacağını kabul, beyan ve taahhüt eder.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Kullanıcı ve Hizmet Kullanımı Şartları</h2>

          <p>
            Kullanıcı, Site'nin ilgili bölümünden Site'ye üye olmak için gerekli kimlik bilgilerinin gönderilmesi suretiyle kayıt işleminin yaptırılması ve alfreya.com tarafından kayıt işleminin onaylanması ile tamamlanır. Kullanıcı işlemi tamamlanmadan, işbu sözleşmede tanımlanan Kullanıcı olma hak ve yetkisine sahip olunamaz.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Tarafların Hak ve Yükümlülükleri</h2>

          <p>
            <strong>5.1.</strong> Kullanıcı, üyelik prosedürlerini yerine getirirken, Site'nin Hizmet'lerinden faydalanırken ve Site'deki Hizmet'lerle ilgili herhangi bir işlemi yerine getirirken, Kullanım Sözleşmesi'nde yer alan tüm şartlara, Site'nin ilgili yerlerinde belirtilen kurallara ve yürürlükteki tüm mevzuata uygun hareket edeceğini, yukarıda belirtilen tüm şart ve kuralları anladığını ve onayladığını kabul, beyan ve taahhüt eder.
          </p>

          <p>
            <strong>5.2.</strong> Kullanıcı, yürürlükteki emredici mevzuat hükümleri gereğince veya diğer Kullanıcı'lar ile üçüncü şahısların/markaların/satıcıların haklarının ihlal edildiğinin iddia edilmesi durumlarında, alfreya.com'un kendisine ait gizli/özel/ticari bilgileri gerek resmi makamlara ve gerekse hak sahibi kişilere açıklamaya yetkili olacağını ve bu sebeple alfreya.com'dan her ne nam altında olursa olsun tazminat talep edilemeyeceğini kabul, beyan ve taahhüt eder.
          </p>

          <p>
            <strong>5.3.</strong> Kullanıcı adı, benzersiz tanımlayıcılar ve erişim kodları (birlikte "Hesap Kimlik Bilgileri") şahsa münhasırdır; üçüncü kişilere devredilemez, temlik edilemez, kiralanamaz veya satılamaz.
          </p>

          <p>
            <strong>5.4.</strong> Kullanıcı'ların alfreya.com tarafından sunulan Hizmet'lerden yararlanabilmek amacıyla kullandıkları sisteme erişim araçlarının (Kullanıcı adı, şifre vb.) güvenliği, saklanması, üçüncü kişilerin bilgisinden uzak tutulması ve kullanılması durumlarıyla ilgili hususlar tamamen Kullanıcı'ların sorumluluğundadır. Kullanıcı'ların, sisteme giriş araçlarının güvenliği, saklanması, üçüncü kişilerin bilgisinden uzak tutulması, kullanılması gibi hususlardaki tüm ihmal ve kusurlarından dolayı Kullanıcı'ların ve/veya üçüncü kişilerin uğradığı veya uğrayabileceği zararlara istinaden alfreya.com'un, doğrudan veya dolaylı, herhangi bir sorumluluğu yoktur.
          </p>

          <p>
            <strong>5.5.</strong> Kullanıcı, Hesabın yetkisiz kullanıldığını veya güvenliğine ilişkin herhangi bir ihlali öğrenir öğrenmez derhâl yazılı olarak Alfreya'e bildirmekle yükümlüdür.
          </p>

          <p>
            <strong>5.6.</strong> Kullanıcı'lar, alfreya.com'un yazılı onayı olmadan, Kullanım Sözleşmesi kapsamındaki hak ve yükümlülüklerini, kısmen veya tamamen, herhangi bir üçüncü kişiye devredemezler.
          </p>

          <p>
            <strong>5.7.</strong> alfreya.com, Kullanıcı'ların Site'de listelenmesine yer verilen ürün açıklamalarına ulaşmasını ve ürünlerin renk, model, cins, vasıf, nitelik ve/veya özellikleri ile ilgili her türlü bilginin güncel olmasını sağlayacaktır. alfreya.com, Kullanıcı'ların Kullanım Sözleşmesi'nde tanımlı olan iş ve işlemleri daha etkin şekilde gerçekleştirebilmelerini sağlamak üzere, dilediği zaman Hizmet'lerinde değişiklikler ve/veya uyarlamalar yapabileceği gibi ek Hizmet'ler de sunabilir. alfreya.com tarafından yapılan bu değişiklikler ve/veya uyarlamalar ve/veya eklenen yeni Hizmet'ler alfreya.com tarafından, ilgili Hizmet'in kullanımıyla ilgili açıklamaların bulunduğu web sayfasından Kullanıcı'lara duyurulur.
          </p>

          <p>
            <strong>5.8.</strong> alfreya.com'un sunduğu Hizmet'lerden yararlananlar ve Site'yi kullananlar, yalnızca hukuka uygun amaçlarla Site üzerinde işlem yapabilirler. Kullanıcı'ların, Site dahilinde yaptığı her işlem ve eylemdeki hukuki ve cezai sorumluluk kendilerine aittir. Her Kullanıcı, alfreya.com ve/veya başka bir üçüncü şahsın ayni veya şahsi haklarına veya (fikri / sinai) malvarlığına tecavüz teşkil edecek şekilde, Site dahilinde bulunan resimleri, metinleri, görsel ve işitsel imgeleri, video kliplerini, dosyaları, veritabanlarını, katalogları ve listeleri çoğaltmayacağını, kopyalamayacağını, dağıtmayacağını, işlemeyeceğini, gerek bu eylemleri ile gerekse de başka yollarla alfreya.com ile doğrudan ve/veya dolaylı olarak rekabete girmeyeceğini kabul, beyan ve taahhüt eder. alfreya.com, Kullanıcının Kullanım Sözleşmesi hükümlerine ve/veya hukuka aykırı olarak Site üzerinde gerçekleştirdikleri faaliyetler nedeniyle üçüncü kişilerin uğradıkları veya uğrayabilecekleri zararlardan doğrudan ve/veya dolaylı olarak, hiçbir şekilde sorumlu tutulamaz.
          </p>

          <p>
            <strong>5.9.</strong> alfreya.com, Site'de sunulan Hizmet'leri ve içerikleri her zaman değiştirebilme; işbu içerikleri Kullanıcı'lar ve Site'yi kullananlar da dahil olmak üzere, üçüncü kişilerin erişimine kapatabilme ve silme hakkını saklı tutmaktadır. alfreya.com, bu hakkını hiçbir bildirimde bulunmadan ve önel vermeden kullanabilir.
          </p>

          <p>
            <strong>5.10.</strong> alfreya.com, Kullanıcı'lar arasında site üzerinden gerçekleşen ve Site'nin işleyişine ve/veya Kullanım Sözleşmesi'ne ve/veya Site'nin genel kurallarına ve/veya genel ahlak kurallarına aykırı ve alfreya.com tarafından kabul edilmesi mümkün olmayan ileti ve/veya içeriklerin tespit edilmesi amacıyla gerekli içerik ve/veya mesaj taraması yapabilir ve tespit ettiği mesaj ve/veya içerikleri istediği zaman ve şekilde erişimden kaldırabilir; alfreya.com, bu mesaj ve/veya içeriği oluşturan Kullanıcı'yı yazılı uyarabilir ve/veya Kullanıcı'nın üyeliğine, herhangi bir ihbar yapmadan, geçici veya kalıcı olarak, son verebilir.
          </p>

          <p>
            <strong>5.11.</strong> alfreya.com, Site'de yer alan üye bilgileri, e-posta adresi ve kullanıcının paylaşmak istediği diğer iletişim bilgilerini [Kullanıcı bilgileri], bilgilendirme, Kullanıcı güvenliği, kendi yükümlülüğünü ifa ve bazı istatistiki değerlendirmeler için zorunlu olduğu ölçüde kullanabilir. Bunları bir veri tabanı üzerinde tasnif edip muhafaza edebilir.
          </p>

          <p>
            <strong>5.12.</strong> Kullanıcı'lar; Site üzerinden erişim verilen ürünlerin satışının gerçekleşeceği Satıcı'lara ait internet sitelerinde, Satıcı'lar tarafından satışa arz edilen ürün/ürünler ve/veya yayınlanan içerik/içeriklerden dolayı alfreya.com'un, alfreya.com çalışanlarının ve yöneticilerinin hiçbir şekilde sorumluluğu bulunmadığını kabul, beyan ve taahhüt eder.
          </p>

          <p>
            <strong>5.13.</strong> alfreya.com tüketiciler için ücretsiz bir keşif ve yönlendirme servisidir. Alışveriş öncesi sipariş edilecek ürünle ilgili geçerli bilgi her zaman için ilgili mağazanın web sitesinden alınmalıdır. alfreya.com'da verilen bilgilerdeki hatalardan, eksikliklerden veya bu bilgilere dayanılarak yapılan işlemler sonucu meydana gelebilecek her türlü maddi ve manevi zararlardan ve her ne şekilde olursa olsun üçüncü kişilerin uğrayabileceği her türlü zararlardan dolayı alfreya.com sorumlu tutulamaz.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Gizlilik Politikası</h2>

          <p>
            alfreya.com, Kullanıcı'lara ilişkin bilgileri, işbu sözleşmenin EK-1 <Link to="/privacy" className="text-blue-600 hover:underline">Gizlilik Politikası</Link> bölümündeki düzenlemelere uygun olarak kullanabilir. alfreya.com, Kullanıcı'lara ait gizli bilgileri, Kullanım Sözleşmesi'nde aksine müsaade edilen durumlar haricinde, üçüncü kişi ve kurumlara kullandırmaz.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Diğer Hükümler</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.1. Fikri Mülkiyet Hakları</h3>

          <p>
            <strong>a)</strong> Site'nin tasarım, metin, imge, html kodu ve diğer kodlar da dahil ve fakat bunlarla sınırlı olmamak kaydıyla tüm unsurları (bundan böyle "alfreya.com'un Telif Haklarına Tabi Çalışmalar" olarak anılacaktır) alfreya.com'a aittir ve/veya alfreya.com tarafından üçüncü bir kişiden alınan lisans hakkı altında kullanılmaktadır. Kullanıcı'lar, Hizmet'leri, alfreya.com bilgilerini ve alfreya.com'un Telif Haklarına Tabi Çalışmaları'nı yeniden satamaz, paylaşamaz, dağıtamaz, sergileyemez veya başkasının Hizmet'lere erişmesine veya kullanmasına izin veremez. Aksi takdirde, lisans verenler de dahil üçüncü kişilerin ve alfreya.com'un uğradıkları zararları ve/veya bu zararlardan dolayı alfreya.com'dan talep edilen tazminat miktarını, mahkeme masrafları ve avukatlık ücreti de dahil olmak üzere, karşılamakla yükümlü olacaklardır. Kullanıcı'lar, alfreya.com'un Telif Haklarına Tabi Çalışmaları'nı çoğaltamaz, dağıtamaz veya bunlardan türemiş çalışmalar yapamaz veya hazırlayamaz.
          </p>

          <p>
            <strong>b)</strong> alfreya.com'un, Hizmet'leri, bilgileri, alfreya.com Telif Haklarına Tabi Çalışmalar'ı, ticari markaları, ticari görünümü veya Site vasıtasıyla sahip olduğu her tür maddi ve fikri mülkiyet hakları da dahil tüm malvarlığı, ayni ve şahsi hakları, ticari bilgi ve know-how'a yönelik tüm hakları saklıdır.
          </p>

          <p>
            <strong>c)</strong> alfreya.com markası tescilli marka olup her türlü kullanımı ilgili yasal mevzuat çerçevesinde saklıdır.
          </p>

          <p>
            <strong>d)</strong> alfreya.com'da yer alan bütün marka ve isimlerin hakları ilgili Satıcılara aittir. alfreya.com, site içeriğini oluştururken diğer taraflara ait fikri mülkiyet haklarını gözetir ve bu tür içerikleri kullanmaz, yayınlamaz. Değişik teknik tedbirlere rağmen alfreya.com'da yayınlanan bir içerikle ilgili herhangi bir fikri mülkiyet hakkı ihlali olduğu düşünülen durumlarda <a href="mailto:info@alfreya.com" className="text-blue-600 hover:underline">info@alfreya.com</a> adresine veya alfreya.com firma adresinde yer alan diğer iletişim yollarıyla bilgi verilmelidir. alfreya.com derhal gerekli incelemeyi ve uygun düzenlemeyi yapmayı taahhüt eder.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.2. Sözleşme Değişiklikleri</h3>

          <p>
            alfreya.com, tamamen kendi takdirine bağlı ve tek taraflı olarak, işbu Kullanım Sözleşmesi'ni, uygun göreceği herhangi bir zamanda, Site'de ilan etmek suretiyle değiştirebilir. İşbu Kullanım Sözleşmesi'nin değişen hükümleri, ilan edildikleri tarihte geçerlilik kazanacak; geri kalan hükümler, aynen yürürlükte kalarak hüküm ve sonuçlarını doğurmaya devam edecektir. İşbu Kullanım Sözleşmesi, Kullanıcı'nın tek taraflı beyanları ile değiştirilemez.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.3. Mücbir Sebepler</h3>

          <p>
            Hukuken mücbir sebep sayılan tüm durumlarda, alfreya.com, işbu sözleşme ile belirlenen edimlerinden herhangi birini geç veya eksik ifa etme veya ifa etmeme nedeniyle yükümlü değildir. Bu ve bunun gibi durumlar, alfreya.com için, gecikme, eksik ifa etme veya ifa etmeme veya temerrüt addedilmeyecek veya bu durumlar için alfreya.com'dan herhangi bir nam altında tazminat talep edilemeyecektir. "Mücbir sebep" terimi, doğal afet, isyan, savaş, grev, iletişim sorunları, altyapı ve internet arızaları, elektrik kesintisi ve kötü hava koşulları da dahil ve fakat bunlarla sınırlı olmamak kaydıyla, ilgili tarafın makul kontrolü haricinde ve alfreya.com'un gerekli özeni göstermesine rağmen önleyemediği, kaçınılamayacak olaylar olarak yorumlanacaktır.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.4. Uygulanacak Hukuk ve Yetki</h3>

          <p>
            İşbu Kullanım Sözleşmesi'nin uygulanmasında, yorumlanmasında ve hükümleri dahilinde doğan hukuki ilişkilerin yönetiminde Türk Hukuku uygulanacaktır. İşbu Kullanım Sözleşmesi'nden doğan veya doğabilecek her türlü ihtilafın hallinde; İstanbul Merkez Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.5. Sözleşmenin Feshi</h3>

          <p>
            İşbu Kullanım Sözleşmesi, süresiz olarak düzenlenmiştir. Kullanıcı veya alfreya.com herhangi bir süre tayinine gerek olmaksızın istediği zaman sözleşmeyi fesih hakkına sahiptir. alfreya.com, Kullanıcı'ların işbu Kullanım Sözleşmesi'ni ve/veya, Site içinde yer alan kullanıma, üyeliğe ve Hizmet'lere ilişkin benzeri kuralları ihlal etmeleri durumunda ve özellikle aşağıda sayılan hallerde, sözleşmeyi tek taraflı olarak feshedebilecek ve Kullanıcı'lar, fesih sebebiyle, alfreya.com'un uğradığı tüm zararları tazmin etmekle yükümlü olacaktır:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Kullanıcı'nın, herhangi bir yöntem kullanarak, Site'nin işleyişini manipüle edecek davranışlarda bulunması</li>
            <li>Site dahilinde bulunan resimleri, metinleri, görsel ve işitsel imgeleri, dosyaları, veri tabanlarını, katalogları ve listeleri izinsiz olarak çoğaltması, kopyalaması, dağıtması ve işlemesi</li>
            <li>Kullanıcı'nın diğer Kullanıcı ve/veya Kullanıcı'ların ve/veya üçüncü kişilerin ve/veya hak sahiplerinin haklarına tecavüz eden ve/veya etme tehlikesi bulunan fillerde bulunması</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Sorumluluk Kısıtlaması</h2>

          <p>
            alfreya.com sitesi, 5651 Sayılı Yasa gereğince içerik sağlayıcı sıfatına sahip değildir. Sitede yer alan hiçbir bilgi ve ürün alfreya.com tarafından üretilmemiş ve ürün tanıtım içeriğine hiçbir müdahalede bulunulmamıştır. alfreya.com sitesi içerisinde yer alan, fiyat, model, renk, stok bilgileri gibi ürüne ait tanıtım içerikleri ve bilgiler ürünün satışa sunulduğu mağaza (Satıcı) tarafından umuma sunulmuş bilgiler olup, sunulan bilgiler "arama optimizasyonu" ile alfreya.com sitesinde görüntülenmektedir ve "Chatgpt ve/veya Gemini senkronizasyonu" ile kişiselleştirilmektedir. Bu nedenle alfreya.com sitesi aranan ve listeye alınan ürünlerin bulunduğu web sitesi ve mağazalarının vermiş olduğu bilgilerin doğruluğunu araştırmaz ve Kullanıcı'larına garanti vermez. Ürünlerin bulunduğu ve yönlendirme yapılan mağazaların varlığı ve verdikleri hizmetlerin tüketici ve mevcut kanunlara uygunluğunu araştırmaz, sitede görüntülenen verileri Kullanıcı'lara reklam ve pazarlama amaçlı sunmaz.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Kişisel Veriler</h2>

          <p>
            Siteyi kullanarak, Alfreya'in sizin adınıza hareket eden analiz hizmeti sağlayıcıları dâhil üçüncü taraf hizmet sağlayıcılarla kişisel verileri toplayabileceğini, kullanabileceğini ve paylaşabileceğini kabul edersiniz; bu sağlayıcılar, Hizmetlerdeki faaliyetlerinizi kaydedebilir veya loglayabilir. Bununla birlikte Alfreya, yürürlükteki hukuk veya yetkili resmî makam tarafından gerekli görülmesi hâlinde verilerinizi açıklayabilir. Hukukun izin verdiği ölçüde, bu tür bir talep hakkında makul çaba göstererek sizi bilgilendirir.
          </p>

          <p>
            Bu Bölümdeki hükümlere bakılmaksızın Alfreya, işbu Sözleşme süresince ve sonrasında, kişisel olarak tanımlayıcı bilgiler çıkarılmış "Toplu/Anonimleştirilmiş Veri"yi dilediği şekilde kullanabilir, kopyalayabilir, satabilir, yayabilir ve başka surette değerlendirebilir.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Sözleşme Ekleri</h2>

          <p>
            <strong>EK-1</strong> <Link to="/privacy" className="text-blue-600 hover:underline">Gizlilik Politikası, Aydınlatma Metni ve Kişisel Veri Korunması Bildirimi</Link>
          </p>

          <p className="text-sm text-gray-600 mt-8">
            Son Güncelleme: Aralık 2025
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
