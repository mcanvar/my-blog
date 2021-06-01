---
title: "Duygu Analizi Çalışması"
slug: "duygu-analizi-calismasi"
date: "12-12-2016"
---


Bu süreç boyunca elde
bulunan [eğitim kümesi](https://mevlutcanvar.com.tr/uygulama-metodlari-egitim-kumesinin-elde-edilmesi) nden veri ambarı
tasarımı yapılması hedeflenir. Kelime bazlı frekans hesabı yapılır, kelime kümesi seçilir, seçilen küme ayrı bir tabloda
saklanır ve kaynak olarak kullanılır. Veri ambarı söz konusu 2 tablo yardımıyla meydana getirilir ve süreç sonucunda
artık veri algoritma girdisi olarak hazır hale gelmiş olur.

Kelime Bazlı Frekans Hesabının Yapılması
========================================

Duygu ağırlığı olan kelimeler seçme aşamasına ulaşabilmek için eğitim kümemizde bulunan girdilerin içeriklerindeki her
bir kelimenin frekans hesabının yapılması gerekir. Bu frekans hesabı sonunda elde edilen yeni veri tabanı tablosundan
kelimeler seçerek veri ambarı tasarlanır.

Bu adımı gerçekleştirmek üzere bir frekans tablosu yaratılır ve bu
tabloya [PHP](https://mevlutcanvar.com.tr/php-betik-programlama-dili) çatımız yardımıyla oluşturulan fonksiyonlar
sayesinde kelimeler eklenir. Fonksiyon her bir girdi metnini alıp boşluklara göre kelimelere böler, girdinin her bir
kelimesini frekans tablosunda arar, varsa sayısını güncelleyerek bir arttırır yoksa tabloya ekleyerek bir sonraki
kelimeye geçer. Kelime seçimi yaparken karar verme açısından yardımcı olsun diye her bir kelime için hangi analizde kaç
tane geçtiği bilgisi de tutulur. Bu işlevler yönetim paneline kazandırılır.

<code class="lang:mysql decode:true" title="words_frequency Tablosu">
CREATE TABLE `words_frequency` (
`id` int(11) NOT NULL,
`word` varchar(50) NOT NULL,
`count` int(11) NOT NULL DEFAULT '0',
`count_n` int(11) NOT NULL DEFAULT '0',
`count_h` int(11) NOT NULL DEFAULT '0',
`count_u` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;</code>
<code class="lang:php decode:true" title="update_frequencies Fonksiyonu">
public function update_frequencies()
{
$data['chosen_entries'] = $this-&gt;Entry_Model-&gt;get_chosen_entries();
foreach ($data['chosen_entries'] as $row){
$entry_words = explode(' ', $row-&gt;content_text);
$entry_words = array_unique($entry_words);
foreach ($entry_words as $word) {
if($this-&gt;Word_Model-&gt;is_adready_inserted($word))
$this-&gt;Word_Model-&gt;count_up_word_f($word, $row-&gt;analysis);
else
$this-&gt;Word_Model-&gt;insert_word_f($word, $row-&gt;analysis);
}
}
redirect('');
}</code>

  <table classs="table" style="height: 333px;" width="447">
    <tbody>
      <tr>
        <td width="90"><strong>ID</strong></td>
        <td width="91"><strong>WORD</strong></td>
        <td width="91"><strong>COUNT</strong></td>
        <td width="92"><strong>COUNT_N</strong></td>
        <td width="93"><strong>COUNT_H</strong></td>
        <td width="92"><strong>COUNT_U</strong></td>
      </tr>
      <tr>
        <td width="90">78</td>
        <td width="91">adam</td>
        <td width="91">830</td>
        <td width="92">406</td>
        <td width="93">207</td>
        <td width="92">217</td>
      </tr>
      <tr>
        <td>236</td>
        <td>iyi</td>
        <td>689</td>
        <td>342</td>
        <td>178</td>
        <td>169</td>
      </tr>
      <tr>
        <td>1341</td>
        <td>lan</td>
        <td>662</td>
        <td>300</td>
        <td>209</td>
        <td>153</td>
      </tr>
      <tr>
        <td width="90">1196</td>
        <td width="91">son</td>
        <td width="91">572</td>
        <td width="92">305</td>
        <td width="93">134</td>
        <td width="92">133</td>
      </tr>
      <tr>
        <td>620</td>
        <td>insan</td>
        <td>555</td>
        <td>252</td>
        <td>131</td>
        <td>172</td>
      </tr>
      <tr>
        <td>175</td>
        <td>guzel</td>
        <td>537</td>
        <td>264</td>
        <td>166</td>
        <td>107</td>
      </tr>
      <tr>
        <td width="90">2056</td>
        <td width="91">yeni</td>
        <td width="91">340</td>
        <td width="92">169</td>
        <td width="93">94</td>
        <td width="92">77</td>
      </tr>
      <tr>
        <td>518</td>
        <td>para</td>
        <td>332</td>
        <td>162</td>
        <td>64</td>
        <td>106</td>
      </tr>
      <tr>
        <td colspan="6" width="547">
          <p style="text-align: center;"><strong>…</strong></p>
        </td>
      </tr>
    </tbody>
  </table>

Çizelge: Frekans tablosundaki bazı kayıtlar.

Bu çalışmada 8 çekirdekli bir bilgisayarda saatlerce frekans hesabı yapıldıktan sonra frekans tablosunda yaklaşık
100.000 kelime yer almış ve bunların arasından yaklaşık 63.000’i sadece bir kez geçmiş olduğu saptanmıştır.

Duygu Ağırlıklı Kelimelerin Seçimi
==================================

Veri ambarı tasarımı hedefine adım adım
yaklaşırken [duygu ağırlıklı kelimeler](https://mevlutcanvar.com.tr/duygu-analizi/350)i seçmek için bir kaynak
oluşturuldu. Bu kaynaktan yararlanarak kelimeler seçilir ve yeni bir seçilmiş kelime tablosu oluşturulur.

Frekans tablosu “COUNT” kolonunun değeriyle büyükten küçüğe doğru sıralanır ve Mysql Workbench yardımıyla Excel CSV
dosyası olarak çıktı alınır. Alınan bu çıktı içerisindeki kelimelerden, araştırmacı ve sözlüğü kullanan kişilerden
oluşan bir takım mutlu veya mutsuz gibi polar ağırlıkları olan kelimeleri tartışarak seçerler. Bu kelimeler çok sayıda
girdi içerisinde geçen kelimeler, sayısı baskın olmasa da keskin bir şekilde duyguyu hissettiren kelimeler ve eğitim
kümesinde kendini ifade etme şansı bulamamış, kullanımı sonucunda duygu ağırlığını ciddi şekilde etkileyen kelimeler
olabilirler. Seçimi tamamlanmış kelimeler seçilen kelime tablosuna aktarılırlar.

Bu çalışmada bu şekilde yaklaşık 200 kelime seçilmiştir. Seçimlere karar verirken daha önce bu konuda çalışmalara imza
atmış olan proje danışmanının yardımlarından yararlanılmıştır.

  <table class="table" style="height: 1521px;" width="588">
    <tbody>
      <tr>
        <td width="75"><strong>WORD</strong></td>
        <td width="48"><strong>CNT</strong></td>
        <td width="109"><strong>WORD</strong></td>
        <td width="42"><strong>CNT</strong></td>
        <td width="99"><strong>WORD</strong></td>
        <td width="42"><strong>CNT</strong></td>
        <td width="85"><strong>WORD</strong></td>
        <td width="42"><strong>CNT</strong></td>
      </tr>
      <tr>
        <td width="75">bile</td>
        <td width="48">1005</td>
        <td width="109">dedim</td>
        <td width="42">188</td>
        <td width="99">chp</td>
        <td width="42">106</td>
        <td width="85">dibine</td>
        <td width="42">36</td>
      </tr>
      <tr>
        <td width="75">ya</td>
        <td width="48">907</td>
        <td width="109">arasinda</td>
        <td width="42">187</td>
        <td width="99">takip</td>
        <td width="42">105</td>
        <td width="85">orgut</td>
        <td width="42">34</td>
      </tr>
      <tr>
        <td width="75">iyi</td>
        <td width="48">689</td>
        <td width="109">turkiyede</td>
        <td width="42">185</td>
        <td width="99">ilan</td>
        <td width="42">103</td>
        <td width="85">tecavuze</td>
        <td width="42">33</td>
      </tr>
      <tr>
        <td width="75">zaten</td>
        <td width="48">669</td>
        <td width="109">SMILEEMOTICON</td>
        <td width="42">175</td>
        <td width="99">arkadasim</td>
        <td width="42">101</td>
        <td width="85">kuran</td>
        <td width="42">33</td>
      </tr>
      <tr>
        <td width="75">lan</td>
        <td width="48">662</td>
        <td width="109">amina</td>
        <td width="42">174</td>
        <td width="99">kan</td>
        <td width="42">99</td>
        <td width="85">vicdan</td>
        <td width="42">30</td>
      </tr>
      <tr>
        <td width="75">insan</td>
        <td width="48">555</td>
        <td width="109">bizi</td>
        <td width="42">172</td>
        <td width="99">hava</td>
        <td width="42">99</td>
        <td width="85">muhalefet</td>
        <td width="42">29</td>
      </tr>
      <tr>
        <td width="75">guzel</td>
        <td width="48">537</td>
        <td width="109">gol</td>
        <td width="42">168</td>
        <td width="99">nefret</td>
        <td width="42">99</td>
        <td width="85">fiziksel</td>
        <td width="42">28</td>
      </tr>
      <tr>
        <td width="75">artik</td>
        <td width="48">535</td>
        <td width="109">calisan</td>
        <td width="42">167</td>
        <td width="99">adamlarin</td>
        <td width="42">98</td>
        <td width="85">polise</td>
        <td width="42">27</td>
      </tr>
      <tr>
        <td width="75">ilk</td>
        <td width="48">526</td>
        <td width="109">cevap</td>
        <td width="42">162</td>
        <td width="99">saygi</td>
        <td width="42">97</td>
        <td width="85">mutsuz</td>
        <td width="42">27</td>
      </tr>
      <tr>
        <td width="75">oyle</td>
        <td width="48">488</td>
        <td width="109">bok</td>
        <td width="42">160</td>
        <td width="99">aciklama</td>
        <td width="42">96</td>
        <td width="85">patlama</td>
        <td width="42">25</td>
      </tr>
      <tr>
        <td width="75">neden</td>
        <td width="48">412</td>
        <td width="109">el</td>
        <td width="42">160</td>
        <td width="99">galatasaray</td>
        <td width="42">96</td>
        <td width="85">pislik</td>
        <td width="42">24</td>
      </tr>
      <tr>
        <td width="75">bunun</td>
        <td width="48">402</td>
        <td width="109">sozluk</td>
        <td width="42">160</td>
        <td width="99">besiktas</td>
        <td width="42">95</td>
        <td width="85">bozuk</td>
        <td width="42">24</td>
      </tr>
      <tr>
        <td width="75">olsa</td>
        <td width="48">387</td>
        <td width="109">maci</td>
        <td width="42">152</td>
        <td width="99">teror</td>
        <td width="42">94</td>
        <td width="85">suriyeli</td>
        <td width="42">24</td>
      </tr>
      <tr>
        <td width="75">fazla</td>
        <td width="48">376</td>
        <td width="109">yoktur</td>
        <td width="42">152</td>
        <td width="99">sikeyim</td>
        <td width="42">79</td>
        <td width="85">gencecik</td>
        <td width="42">24</td>
      </tr>
      <tr>
        <td width="75">insanlar</td>
        <td width="48">359</td>
        <td width="109">kendisine</td>
        <td width="42">146</td>
        <td width="99">adalet</td>
        <td width="42">79</td>
        <td width="85">osmanli</td>
        <td width="42">24</td>
      </tr>
      <tr>
        <td width="75">beni</td>
        <td width="48">342</td>
        <td width="109">hak</td>
        <td width="42">145</td>
        <td width="99">anasini</td>
        <td width="42">78</td>
        <td width="85">islami</td>
        <td width="42">23</td>
      </tr>
      <tr>
        <td width="75">yeni</td>
        <td width="48">340</td>
        <td width="109">cocugu</td>
        <td width="42">145</td>
        <td width="99">islam</td>
        <td width="42">78</td>
        <td width="85">muslumanlar</td>
        <td width="42">21</td>
      </tr>
      <tr>
        <td width="75">kisi</td>
        <td width="48">337</td>
        <td width="109">sabah</td>
        <td width="42">141</td>
        <td width="99">sozlukte</td>
        <td width="42">77</td>
        <td width="85">nobel</td>
        <td width="42">21</td>
      </tr>
      <tr>
        <td width="75">hicbir</td>
        <td width="48">337</td>
        <td width="109">orospu</td>
        <td width="42">141</td>
        <td width="99">canim</td>
        <td width="42">77</td>
        <td width="85">irkci</td>
        <td width="42">20</td>
      </tr>
      <tr>
        <td width="75">ulan</td>
        <td width="48">336</td>
        <td width="109">gelecek</td>
        <td width="42">140</td>
        <td width="99">terorist</td>
        <td width="42">76</td>
        <td width="85">yasta</td>
        <td width="42">20</td>
      </tr>
      <tr>
        <td width="75">para</td>
        <td width="48">332</td>
        <td width="109">entry</td>
        <td width="42">140</td>
        <td width="99">aci</td>
        <td width="42">75</td>
        <td width="85">kizla</td>
        <td width="42">18</td>
      </tr>
      <tr>
        <td width="75">burada</td>
        <td width="48">325</td>
        <td width="109">cikip</td>
        <td width="42">138</td>
        <td width="99">tecavuz</td>
        <td width="42">74</td>
        <td width="85">pezevenk</td>
        <td width="42">18</td>
      </tr>
      <tr>
        <td width="75">eden</td>
        <td width="48">303</td>
        <td width="109">kendine</td>
        <td width="42">136</td>
        <td width="99">efendim</td>
        <td width="42">74</td>
        <td width="85">polisler</td>
        <td width="42">18</td>
      </tr>
      <tr>
        <td width="75">an</td>
        <td width="48">302</td>
        <td width="109">futbol</td>
        <td width="42">135</td>
        <td width="99">pkk</td>
        <td width="42">73</td>
        <td width="85">bal</td>
        <td width="42">18</td>
      </tr>
      <tr>
        <td width="75">olmayan</td>
        <td width="48">302</td>
        <td width="109">kardesim</td>
        <td width="42">134</td>
        <td width="99">film</td>
        <td width="42">73</td>
        <td width="85">vur</td>
        <td width="42">18</td>
      </tr>
      <tr>
        <td width="75">sizin</td>
        <td width="48">289</td>
        <td width="109">bunlarin</td>
        <td width="42">134</td>
        <td width="99">sehit</td>
        <td width="42">67</td>
        <td width="85">sabir</td>
        <td width="42">17</td>
      </tr>
      <tr>
        <td width="75">tarafindan</td>
        <td width="48">271</td>
        <td width="109">insanlari</td>
        <td width="42">132</td>
        <td width="99">futbolcu</td>
        <td width="42">66</td>
        <td width="85">karanlik</td>
        <td width="42">17</td>
      </tr>
      <tr>
        <td width="75">kotu</td>
        <td width="48">260</td>
        <td width="109">parti</td>
        <td width="42">132</td>
        <td width="99">soguk</td>
        <td width="42">64</td>
        <td width="85">kahkaha</td>
        <td width="42">17</td>
      </tr>
      <tr>
        <td width="75">allah</td>
        <td width="48">254</td>
        <td width="109">a</td>
        <td width="42">129</td>
        <td width="99">bomba</td>
        <td width="42">64</td>
        <td width="85">sikik</td>
        <td width="42">16</td>
      </tr>
      <tr>
        <td width="75">ulkede</td>
        <td width="48">253</td>
        <td width="109">milli</td>
        <td width="42">128</td>
        <td width="99">isid</td>
        <td width="42">63</td>
        <td width="85">gotunuze</td>
        <td width="42">16</td>
      </tr>
      <tr>
        <td width="75">gerek</td>
        <td width="48">250</td>
        <td width="109">yalniz</td>
        <td width="42">128</td>
        <td width="99">sicak</td>
        <td width="42">62</td>
        <td width="85">saniyorsunuz</td>
        <td width="42">16</td>
      </tr>
      <tr>
        <td width="75">adamlar</td>
        <td width="48">249</td>
        <td width="109">baslik</td>
        <td width="42">127</td>
        <td width="99">dizi</td>
        <td width="42">61</td>
        <td width="85">bombayi</td>
        <td width="42">15</td>
      </tr>
      <tr>
        <td width="75">oy</td>
        <td width="48">247</td>
        <td width="109">kendimi</td>
        <td width="42">127</td>
        <td width="99">sampiyon</td>
        <td width="42">57</td>
        <td width="85">burs</td>
        <td width="42">15</td>
      </tr>
      <tr>
        <td width="75">tabi</td>
        <td width="48">244</td>
        <td width="109">sacma</td>
        <td width="42">127</td>
        <td width="99">SADEMOTICON</td>
        <td width="42">51</td>
        <td width="85">cocukluk</td>
        <td width="42">14</td>
      </tr>
      <tr>
        <td width="75">olabilir</td>
        <td width="48">238</td>
        <td width="109">yazik</td>
        <td width="42">125</td>
        <td width="99">euro</td>
        <td width="42">48</td>
        <td width="85">multeci</td>
        <td width="42">14</td>
      </tr>
      <tr>
        <td width="75">yaptigi</td>
        <td width="48">237</td>
        <td width="109">ciddi</td>
        <td width="42">124</td>
        <td width="99">cay</td>
        <td width="42">46</td>
        <td width="85">hmm</td>
        <td width="42">14</td>
      </tr>
      <tr>
        <td width="75">onemli</td>
        <td width="48">237</td>
        <td width="109">evde</td>
        <td width="42">123</td>
        <td width="99">sert</td>
        <td width="42">45</td>
        <td width="85">dondurma</td>
        <td width="42">14</td>
      </tr>
      <tr>
        <td width="75">cocuk</td>
        <td width="48">235</td>
        <td width="109">polis</td>
        <td width="42">120</td>
        <td width="99">katil</td>
        <td width="42">45</td>
        <td width="85">cocugunun</td>
        <td width="42">14</td>
      </tr>
      <tr>
        <td width="75">bence</td>
        <td width="48">234</td>
        <td width="109">mutlu</td>
        <td width="42">119</td>
        <td width="99">genis</td>
        <td width="42">45</td>
        <td width="85">siddetli</td>
        <td width="42">13</td>
      </tr>
      <tr>
        <td width="75">akp</td>
        <td width="48">234</td>
        <td width="109">yahu</td>
        <td width="42">116</td>
        <td width="99">birinci</td>
        <td width="42">44</td>
        <td width="85">irkcilik</td>
        <td width="42">12</td>
      </tr>
      <tr>
        <td width="75">diyor</td>
        <td width="48">230</td>
        <td width="109">mal</td>
        <td width="42">116</td>
        <td width="99">saldiri</td>
        <td width="42">44</td>
        <td width="85">icmeye</td>
        <td width="42">11</td>
      </tr>
      <tr>
        <td width="75">hemen</td>
        <td width="48">229</td>
        <td width="109">eksi</td>
        <td width="42">113</td>
        <td width="99">lanet</td>
        <td width="42">43</td>
        <td width="85">jest</td>
        <td width="42">11</td>
      </tr>
      <tr>
        <td width="75">mesela</td>
        <td width="48">214</td>
        <td width="109">gordum</td>
        <td width="42">110</td>
        <td width="99">tatli</td>
        <td width="42">41</td>
        <td width="85">hastane</td>
        <td width="42">11</td>
      </tr>
      <tr>
        <td width="75">ulkenin</td>
        <td width="48">210</td>
        <td width="109">hdp</td>
        <td width="42">110</td>
        <td width="99">siddet</td>
        <td width="42">39</td>
        <td width="85">polisten</td>
        <td width="42">10</td>
      </tr>
      <tr>
        <td width="75">insanlarin</td>
        <td width="48">209</td>
        <td width="109">ev</td>
        <td width="42">110</td>
        <td width="99">serefsiz</td>
        <td width="42">38</td>
        <td width="85">yerim</td>
        <td width="42">10</td>
      </tr>
      <tr>
        <td width="75">kiz</td>
        <td width="48">205</td>
        <td width="109">takimi</td>
        <td width="42">109</td>
        <td width="99">evin</td>
        <td width="42">37</td>
        <td width="85">yaratiklar</td>
        <td width="42">9</td>
      </tr>
      <tr>
        <td width="75">sanirim</td>
        <td width="48">196</td>
        <td width="109">oglum</td>
        <td width="42">108</td>
        <td width="99">hirsiz</td>
        <td width="42">36</td>
        <td width="85">mina</td>
        <td width="42">8</td>
      </tr>
      <tr>
        <td width="75">devlet</td>
        <td width="48">196</td>
        <td width="109">kadinin</td>
        <td width="42">107</td>
        <td width="99">ataturk</td>
        <td width="42">36</td>
        <td width="85">iftira</td>
        <td width="42">7</td>
      </tr>
      <tr>
        <td width="75">takim</td>
        <td width="48">195</td>
        <td width="109">devletin</td>
        <td width="42">107</td>
        <td width="99">aksine</td>
        <td width="42">36</td>
        <td width="85">dumur</td>
        <td width="42">7</td>
      </tr>
      <tr>
        <td width="75">ulke</td>
        <td width="48">194</td>
        <td width="109">fenerbahce</td>
        <td width="42">107</td>
        <td width="99"></td>
        <td width="42"></td>
        <td width="85"></td>
        <td width="42"></td>
      </tr>
    </tbody>
  </table>

Çizelge: Duygu ağırlığı olan seçilmiş sözcükler.

Veri Ambarının Dinamik Olarak İnşa Edilmesi
===========================================

Veri madenciliği algoritmalarının girdisi olarak kabul ettiğimiz veri matrisinin oluşturulması için atılan adımlar
tamamlandığında veri tabanı tablosu bu kez farklı bir biçimde tasarlanır. Adım adım oluşturulan süreçlerin işaret ettiği
tablodur veri ambarı. Her bir satırı bir girdiyi temsil eder ve her bir sütunu seçilmiş olan kelimelerden meydana gelir.
Girdi içerisinde geçen kelimeler ilgili sütunda 1 değerini alırken içermeyenler 0 değerlerini alırlar. Kelime
sütunlarının sonunda girdinin analizini tutan kolon bulunur.

  <table class="table">
    <tbody>
      <tr>
        <td width="41"><strong>ID</strong></td>
        <td width="96"><strong>ENTRY_ID</strong></td>
        <td width="90"><strong>WORD_23</strong></td>
        <td width="111">
          <p style="text-align: center;"><strong>…</strong></p>
        </td>
        <td width="114"><strong>WORD_63741</strong></td>
        <td width="95"><strong>ANALYSIS</strong></td>
      </tr>
      <tr>
        <td width="41">1</td>
        <td width="96">2</td>
        <td width="90">1</td>
        <td rowspan="4" width="111">
          <p style="text-align: center;"><strong>…</strong></p>
        </td>
        <td width="114">0</td>
        <td width="95">n</td>
      </tr>
      <tr>
        <td width="41">2</td>
        <td width="96">5</td>
        <td width="90">1</td>
        <td width="114">0</td>
        <td width="95">h</td>
      </tr>
      <tr>
        <td width="41">3</td>
        <td width="96">8</td>
        <td width="90">0</td>
        <td width="114">0</td>
        <td width="95">u</td>
      </tr>
      <tr>
        <td colspan="3" width="227">
          <p style="text-align: center;"><strong>…</strong></p>
        </td>
        <td colspan="2" width="209">
          <p style="text-align: center;"><strong>…</strong></p>
        </td>
      </tr>
    </tbody>

  </table>

Çizelge: Veri ambarı tablosunun yapısı.

Yönetim panelinin duygu analizi sürecindeki fonksiyonlardan sonuncusu olan veri ambarının oluşturulması birkaç adımdan
oluşur. İlk olarak tablo yapısına seçilen kelimelerin benzersiz sütunları “WORD\_” kelimesinin sonuna bir alttan tire
sonrasında eklenerek kolonlar oluşturulur. Böylece veri ambarının genişliği dinamik olarak kurulmuş olur. Sonrasında her
bir girdi tekrar kelimelerine ayrıştırılıp, sırasıyla her girdi kelimesi seçilen kelime tablosundaki bütün kelimeler ile
karşılaştırılır. Eğer eşleşme gerçekleşirse girdi veri ambarına ilgili kelime için 1 değerini alarak kaydedilir.

Duygu analizi sırasında projenin planladığı bir diğer başarım metodu ise veri ambarını 3 farklı biçimde tasarlamaktır.
Bu tasarım sayesinde veriler 2 boyutlu olarak duygu analizinden geçebileceklerdir. 1. boyutta girdiler nötr yada polar,

2. boyutta ise mutlu yada mutsuz olarak işaretlenebilir hale geleceklerdir. Bunu gerçekleştirmek için yönetim paneline
   seçenek eklenir.

<code class="lang:mysql decode:true" title="words Tablosu">
CREATE TABLE `words` (
  `id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `length` bigint(20) NOT NULL,
  `analysis` varchar(1) DEFAULT 'n'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
</code>


<pre class="lang:default decode:true" title="Kontrol Fonksiyonları">
public function build()
{
	$fields = array();
	$results = array();

	$data['chosen_words'] = $this->Word_Model->get_chosen_words();
	foreach ($data['chosen_words']  as $row)
		$results[] = array( 'id' => $row->id );

	foreach ($results as $value)
		$fields[ 'word_'.$value['id'] ] = array('type' => 'INT', 'constraint' => 1, 'default' => 0);

	if($this->Word_Model->add_column_to_cws($fields))
		redirect('');
}
public function drop_columns()
{
$results = array();

	$data['chosen_words'] = $this->Word_Model->get_chosen_words();
	foreach ($data['chosen_words']  as $row)
		$results[] = array( 'id' => $row->id );

	foreach ($results as $value)
		$this->Word_Model->drop_column_from_cws( 'word_'.$value['id'] );

	redirect('');
}
function truncate()
{
if($this->Word_Model->truncate_table())
redirect('');
}
public function update()
{
$result = $this->Word_Model->get_chosen_words();
$this->Entry_Model->update_whole_table($result);

	redirect('');
}

public function clear()
{
$this->Entry_Model->clear_notr_entries();
redirect('');
}
public function clear_weaks()
{
$data['chosen_words'] = $this->Word_Model->get_chosen_words();
foreach ($data['chosen_words']  as $row)
$results[] = array( 'id' => $row->id );
$data['words'] = $this->Word_Model->get_words();
foreach ($data['words'] as $row)
if( $this->Entry_Model->clear_weak_entry($row->id, $results) )
$this->Entry_Model->delete_word_by_id($row->id);

	redirect('');
}
</pre>

Yukarıdaki şekildeki aşamalardan geçerek oluşan veri ambarı artık veri madenciliği işlemine hazırdır. Projede karar
kılınan veri ambarı yapısı aşağıdaki çizelgede gösterilen testler sonucunda yaklaşık 200 seçilmiş kelime kolonundan
oluşan ve içerisinde en az 3 seçilmiş kelime geçen girdilerden meydana gelir. Bu bağlamda uygulama kolaylığı ve verdiği
başarı göz önüne
alınarak [SMO algoritması](https://mevlutcanvar.com.tr/uygulama-metodlari-egitim-kumesinin-isaretlenmesi) veri
madenciliği yöntemi olarak seçilmiştir.

Veri Madenciliği Aşaması
========================

Bütün olarak sürecin son adımı olan bu adımda veri madenciliği uygulamaları test edilerek oluşturulan veri ambarından
amacına uygun, en verimli olanını seçmek hedeflenir. Bu seçim 2 boyutta oluşturulan verilerin başarı oranlarıyla
yapılır. Birinci boyutta verinin polaritesine göre, ikinci boyutta ise verinin duygu türüne göre ölçümler yapılır. SMO
fonksiyonel algoritmasıyla gerçekleştirilen [WEKA](https://mevlutcanvar.com.tr/tez-metodlari-weka-kullanimi) çalışması.

Veri ambarı Workbench yardımı ile CSV formatında dışa aktarılır. WEKA’nın Explorer penceresinden dışa aktardığımız dosya
seçilir ve ilk iki sütun bir karara etkisi olmadığı için devre dışı bırakılır. Sınıflandırma sekmesinden bir algoritma
seçilir ve Cross-Validation seçeneği ile sonuç elde edilir. Bu yöntem veriyi yanındaki kutuda belirtilen yüzdeye göre
bölerek her defasında farklı bir parçasından olmak üzere test ederek sonuç ürettiği için daha verimli sonuçlar elde
edilebilir.

<table class="table" width="538"><tbody><tr><td width="94"><strong>ALG.</strong></td><td width="189"><strong>YÖNTEM</strong></td><td width="85"><strong>N H U</strong></td><td width="85"><strong>N P</strong></td><td width="85"><strong>H U</strong></td></tr><tr><td rowspan="6" width="94"><strong>NaiveBayes</strong></td><td width="189">100 Kelime (6323)</td><td width="85">46.0699 %</td><td width="85">54.2464 %</td><td width="85">62.4927 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(2309)</td><td width="85">48.246&nbsp; %</td><td width="85">56.9511 %</td><td width="85">68.9984 %</td></tr><tr><td width="189">150 Kelime (6323)</td><td width="85">45.0894 %</td><td width="85">55.9545 %</td><td width="85">62.9597 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(3043)</td><td width="85">48.4719 %</td><td width="85">59.4151 %</td><td width="85">68.6732 %</td></tr><tr><td width="189">200 Kelime (6323)</td><td width="85">45.3582 %</td><td width="85">56.0177 %</td><td width="85">63.1349 %</td></tr><tr><td width="189">‘’ Min 3 kel.içeren(3239)</td><td width="85">48.3483 %</td><td width="85">58.9071 %</td><td width="85">68.8005 %</td></tr><tr><td rowspan="6" width="94"><strong>SMO</strong></td><td width="189">100 Kelime (6323)</td><td width="85">47.6198 %</td><td width="85">55.6856 %</td><td width="85">63.8646 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(2309)</td><td width="85">49.5453 %</td><td width="85">56.9078 %</td><td width="85">68.9984 %</td></tr><tr><td width="189">150 Kelime (6323)</td><td width="85">48.1575 %</td><td width="85">57.789&nbsp; %</td><td width="85">65.2948 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(3043)</td><td width="85">50.838&nbsp; %</td><td width="85">58.6592 %</td><td width="85">68.1204 %</td></tr><tr><td width="189">200 Kelime (6323)</td><td width="85">48.6636 %</td><td width="85">57.9155 %</td><td width="85">65.5867 %</td></tr><tr><td width="189">‘’ Min 3 kel.içeren(3239)</td><td width="85">51.59&nbsp;&nbsp; %</td><td width="85">58.2587 %</td><td width="85">69.6078 %</td></tr><tr><td rowspan="6" width="94"><strong>lazyIBk</strong></td><td width="189">100 Kelime (6323)</td><td width="85">44.0614 %</td><td width="85">52.5384 %</td><td width="85">58.9901 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(2309)</td><td width="85">41.1&nbsp;&nbsp;&nbsp; %</td><td width="85">51.3209 %</td><td width="85">56.8362 %</td></tr><tr><td width="189">150 Kelime (6323)</td><td width="85">43.9348 %</td><td width="85">53.3449 %</td><td width="85">58.7274 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(3043)</td><td width="85">43.2468 %</td><td width="85">51.6595 %</td><td width="85">58.3538 %</td></tr><tr><td width="189">200 Kelime (6323)</td><td width="85">44.4251 %</td><td width="85">53.3133 %</td><td width="85">58.202&nbsp; %</td></tr><tr><td width="189">‘’ Min 3 kel.içeren(3239)</td><td width="85">43.5011 %</td><td width="85">51.0034 %</td><td width="85">58.5352 %</td></tr><tr><td rowspan="6" width="94"><strong>J48</strong></td><td width="189">100 Kelime (6323)</td><td width="85">44.346&nbsp; %</td><td width="85">54.6734 %</td><td width="85">61.7046 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(2309)</td><td width="85">41.0134 %</td><td width="85">52.9233 %</td><td width="85">61.3672 %</td></tr><tr><td width="189">150 Kelime (6323)</td><td width="85">44.2828 %</td><td width="85">55.3693 %</td><td width="85">61.9089 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(3043)</td><td width="85">43.1811 %</td><td width="85">55.2744 %</td><td width="85">61.4251 %</td></tr><tr><td width="189">200 Kelime (6323)</td><td width="85">44.0297 %</td><td width="85">55.5907 %</td><td width="85">60.3327 %</td></tr><tr><td width="189">‘’ Min 3 kel.içeren(3239)</td><td width="85">44.3347 %</td><td width="85">55.2331 %</td><td width="85">60.6113 %</td></tr><tr><td rowspan="6" width="94"><strong>Random Forest</strong></td><td width="189">100 Kelime (6323)</td><td width="85">44.346&nbsp; %</td><td width="85">54.3413 %</td><td width="85">62.4051 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(2309)</td><td width="85">47.2066 %</td><td width="85">56.2148 %</td><td width="85">67.0906 %</td></tr><tr><td width="189">150 Kelime (6323)</td><td width="85">45.121&nbsp; %</td><td width="85">55.907&nbsp; %</td><td width="85">62.843&nbsp; %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(3043)</td><td width="85">47.6503 %</td><td width="85">57.3447 %</td><td width="85">66.0934 %</td></tr><tr><td width="189">200 Kelime (6323)</td><td width="85">46.1964 %</td><td width="85">56.8559 %</td><td width="85">63.7186 %</td></tr><tr><td width="189">‘’ Min 3 kel.içeren(3239)</td><td width="85">49.3053 %</td><td width="85">57.3016 %</td><td width="85">68.3391 %</td></tr><tr><td rowspan="6" width="94"><strong>SimpleCart</strong></td><td width="189">100 Kelime (6323)</td><td width="85">46.9872 %</td><td width="85">55.5274 %</td><td width="85">60.7706 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(2309)</td><td width="85">46.9034 %</td><td width="85">55.6951 %</td><td width="85">62.8776 %</td></tr><tr><td width="189">150 Kelime (6323)</td><td width="85">47.0505 %</td><td width="85">56.6661 %</td><td width="85">60.7414 %</td></tr><tr><td width="189">‘’ Min 3 kel. içeren(3043)</td><td width="85">47.5846 %</td><td width="85">57.0818 %</td><td width="85">61.3022 %</td></tr><tr><td width="189">200 Kelime (6323)</td><td width="85">47.0346 %</td><td width="85">56.761&nbsp; %</td><td width="85">61.0625 %</td></tr><tr><td width="189">‘’ Min 3 kel.içeren(3239)</td><td width="85">47.5764 %</td><td width="85">57.0238 %</td><td width="85">61.4764 %</td></tr></tbody></table>

Çizelge: Sınıflandırma algoritmalarının WEKA’da veri ambarı başarım tablosu.

Bu projede yapılan testler sonucunda karşılaştırmalar ve fikir yürütmeler yapılmış,  SMO algoritması seçilmiştir. Böylece veri madenciliği çalışması burada sona ermiş ve artık projeyi gerçekleştirme adımına geçmek için bir engel kalmamıştır. WEKA çıktıları SMO fonksiyonel algoritmasının ürettiği değerleri bünyesinde tuttuğu için bu veriler kaydedilerek gerçekleştirim aşamasında kullanılmak üzere saklanır.
