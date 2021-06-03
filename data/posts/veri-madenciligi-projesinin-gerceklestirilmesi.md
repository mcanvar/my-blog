---
title: "p"
slug: "veri-madenciligi-projesinin-gerceklestirilmesi"
date: "25/12/2016"
---

Veri Madenciliği Projesinin Gerçekleştirilmesi
========================================
Proje aşağıdaki temel iki adımda gerçekleştirildikten sonra yayınlanmak üzere internet sitesi Linux sunucu üzerinde kurulu MySQL, PHP ve Apache barındıran bir sunucuda, internet servisi ise Linux tabanlı Ubuntu işletim sistemi üzerine MYSQL ve Tomcat barındıran bir sunucuda yayınlanır.
İnternet Sitesi

Veri işaretleme aşamasında eksik kalan, projenin ön yüzü için seçilen temada ana sayfa bölümü ve girdi işaretleme sayfaları tasarlanır ve ilgili kontrolcüler oluşturulur. Ana sayfa tasarlanırken zaman tüneli olarak birçok girdiyi barındıracak şeklinde oluşturulur.

https://eksiveri.mevlutcanvar.com.tr İşaretlenmek üzere alınan girdi numarası.

Ek olarak bir Bootstrap ön yüz çatısı elemanı olan modal kullanılarak girdi numarası için açılır bir pencere tasarlanır. Bu pencere tek girdilik bir eleman taşır ve burası yardımı ile girdi numarasını alarak internet servisine gönderir. İnternet servisi gelen girdi numarasına göre yanıt üretir ve Json tipinde cevap üretir. İşaretlenmiş olarak gelen veri ilgili kontrolcü tarafından yakalanır ve yayınlanır.
İşaretlenmiş olarak görüntülenen girdi. İşaretlenmiş olarak görüntülenen girdi.

```
public function index()
{
$this->load->model('Analyse_Model');
$entryid =  $this->input->post('entryid');

	$content = file_get_contents('http://localhost:8080/Api/EntryId/'.$entryid);
	if ($content === false) {
		redirect('');
	}

	$entry = json_decode($content);

	$analyseH = 0;
	$analyseN = 0;
	$analyseU = 0;

	if($entry->analysis === 'h')
		$analyseH = 1;
	elseif ($entry->analysis === 'n')
		$analyseN = 1;
	elseif ($entry->analysis === 'u')
		$analyseU = 1;

	$data = array(
									'number' => $entry->number,
									'header' => $entry->header,
									'header_source' => $entry->headerSource,
									'content' => $entry->contentHtml,
									'author' => $entry->author,
									'author_source' => $entry->authorSource,
									'happy' => $analyseH,
									'neutral' => $analyseN,
									'unhappy' => $analyseU,
									'np_weight' => $entry->notrPolarWeight,
									'hu_weight' => $entry->happyUnhappyWeight,
									'like_count' => 0
								);

	if(!$this->Analyse_Model->insert_analyzed_entry($data)){
		redirect('');
	}

	$this->data['entry'] = $entry;
	$this->data['hnu'] = $data;

	//$this->data['pagetitle'] = 'test';
$this->render('analyse_view');
//$this->render(NULL, 'json');
}
}
```

##Web Servisi

Spring MVC internet servisi projesi olarak IntelliJ IDEA’da açılan projeye Maven yardımı ile gerekli bağımlılıklar inşa edilerek proje gerçekleştirilir. Gelen girdi numarası girdi UPA’sı olarak görev yapan ApiController tarafından yakalanarak, Hibernate ile ilgili modelden veriyi edinip, ilgili servis katmanına iletilir ve burada iş mantığı yürütülür. Servis katmanı girdiyi işaretleyerek kontrolcüye geri verir ve kontrolcü cevabı Json formatında isteği isteyen istemciye iletir.
İşaretlenmek üzere Ekşi Sözlük’te yer alan girdi. İşaretlenmek üzere Ekşi Sözlük’te yer alan girdi.

```
@Service("ApiService")
@Transactional
public class ApiServiceImpl implements ApiService {

@Autowired
private WordDAO wordDAO;

private static final String ENTRY_SOURCE = "https://eksisozluk.com/entry/";

Entry entry = new Entry( 0, "", "", "", "", "", "", "", 0, 'e', 0.0, 0.0 );

public Entry loadEntryBody(long entryNumber) {

    Document document = null;
    String tempContentText = "";

    try {
        document = Jsoup.connect(ENTRY_SOURCE + entryNumber)
                .ignoreContentType(true)
                .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1")
                .referrer("https://www.google.com")
                .timeout(12000)
                .followRedirects(true)
                .get();
    } catch (IOException e) {
        System.out.println("Entry not found!");
        return null;
//            e.printStackTrace();
}

    Element content = document.getElementById("content");

    entry.setNumber(entryNumber);

    entry.setHeader(content.getElementById("title").getElementsByTag("a").select("span").text());
    entry.setHeaderSource(content.getElementById("title").getElementsByTag("a").attr("href"));

    tempContentText = content.getElementsByClass("content").text();

    tempContentText = preprocessingText(tempContentText);


    entry.setContentText( tempContentText );
    entry.setContentHtml(content.getElementsByClass("content").outerHtml());

    entry.setTime( content.getElementsByClass("entry-date").first().text() );

    entry.setAuthor( content.getElementsByClass("entry-author").text() );
    entry.setAuthorSource( content.getElementsByClass("entry-author").attr("href") );

    entry = sentimentAnalysis(entry, tempContentText);

    System.out.println( entry.getContentText() );

    entry.setLength(entry.getContentText().length());

    return entry;
}

public String preprocessingText(String text) {

    ArrayList<String> arrayList = new ArrayList<String>();
    String tempContentText = " ";

    text = " "+text+" ";
    text = tagSmileys(text);
    text = clearEksiWords(text);
    text = clearPunctation(text);
    text = clearRedundantWords(text);
    text = convertTRChars(text);
    // arrayList = distinctWords(text);

    for (String word : text.split("\\W+"))
        tempContentText += word + " ";

    return tempContentText;
}
public Entry sentimentAnalysis(Entry entry, String text) {

    List<Word> wordList = wordDAO.findAllWords();
    String[] entryWords = text.split("\\u0020");

    double sumOfNP = calculateSumOfSmoNP(wordList, entryWords);
    double sumOfHU = calculateSumOfSmoHU(wordList, entryWords);

    if( sumOfNP == 0.0 && sumOfHU == 0.0)
        entry.setAnalysis('z');
    else if(sumOfNP < -0.2)
        entry.setAnalysis('n');
    else {
        if (sumOfHU > 0)
            entry.setAnalysis('h');
        else
            entry.setAnalysis('u');
    }

    entry.setNotrPolarWeight(sumOfNP);
    entry.setHappyUnhappyWeight(sumOfHU);

    return entry;
}

private double calculateSumOfSmoHU(List<Word> wordList, String[] entryWords) {

    double sumOfWeights = -0.0904;

    for (String wordOfEntry : entryWords){
        for (Word wordOfList : wordList){
            if ( wordOfEntry.equals( wordOfList.getWord() ) ){
                sumOfWeights += wordOfList.getSmoHU();
            }
        }
    }

    return sumOfWeights;
}

private double calculateSumOfSmoNP(List<Word> wordList, String[] entryWords) {

    double sumOfWeights = 0.3496;

    for (String wordOfEntry : entryWords){
        for (Word wordOfList : wordList){
            if ( wordOfEntry.equals( wordOfList.getWord() ) ){
                sumOfWeights += wordOfList.getSmoNP();
            }
        }
    }

    return sumOfWeights;
}
```
