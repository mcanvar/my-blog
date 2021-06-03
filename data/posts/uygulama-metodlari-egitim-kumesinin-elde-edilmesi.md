---
title: "Uygulama Metodları: Eğitim Kümesinin Elde Edilmesi"
slug: "uygulama-metodlari-egitim-kumesinin-elde-edilmesi"
date: "21/11/2016"
---

Uygulama Metodları: Eğitim Kümesinin Elde Edilmesi
========================================
Sürecin ilk aşamasının hedefi olan eğitim kümesini elde etmek için [Ekşi Sözlük](https://mevlutcanvar.com.tr/eksi-sozlukte-veri-madenciligi)‘ün herhangi bir UPA’sı olmadığı için küme HTTP istekleri ile elde edilecektir. Bunun için [import.io özelleştirilmiş tarayıcısı](https://mevlutcanvar.com.tr/import-io-ozellestirilmis-tarayicisi) kullanılacaktır.

Eğitim kümesi için planlanan girdi sayısı 10.000’dir. Bu girdiler, Türkiye’nin toplumsal olarak yaşadığı 5 mutsuz gün, 5 mutlu gün ve 10 tane de 2009 yılından günümüze kadarki süreçten rasgele günler seçilerek sözlüğün o günkü en çok beğenilen başlıklar sıralaması ile sıralanmış ve sayfa linkleri site tarayıcısına verilmek üzere toplanmıştır.


<table class="table">
  <tbody>
    <tr>
      <td style="text-align: center;" width="274">
        <strong>Günü Seçilen Olay</strong>
      </td>
      <td style="text-align: center;" width="274"><strong>Etiket</strong></td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">
        Aziz Sancar’ın Nobel Ödülü Alması
      </td>
      <td style="text-align: center;" width="274">#mutlu</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">
        Arda Turan’ın Barselona Transferi
      </td>
      <td style="text-align: center;" width="274">#mutlu</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">Fransa’da Terör Saldırısı</td>
      <td style="text-align: center;" width="274">#mutsuz</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">
        Özgecan Asan’ın Katledilmesi
      </td>
      <td style="text-align: center;" width="274">#mutsuz</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">İrlandalı Turist Haberi</td>
      <td style="text-align: center;" width="274">#mutlu</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">Kenan Sofuoğlu Haberi</td>
      <td style="text-align: center;" width="274">#mutlu</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">Aylan Kurdi Haberi</td>
      <td style="text-align: center;" width="274">#mutsuz</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">Başkent Terör Saldırısı</td>
      <td style="text-align: center;" width="274">#mutsuz</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">1 Kasım Seçimi</td>
      <td style="text-align: center;" width="274">#mutsuz</td>
    </tr>
    <tr>
      <td style="text-align: center;" width="274">Milli Maç</td>
      <td style="text-align: center;" width="274">#mutlu</td>
    </tr>
  </tbody>
</table>

Çizelge 4.1. Eğitim kümesi için seçilen özel günler.

Örnek seçilen 1 gün için link yapısı:

> https://eksisozluk.com/basliklar/ara? searchForm.Keywords=&searchForm.Author=&searchForm.When.From=2008-06-20&searchForm.When.To=2008-06-22&searchForm.NiceOnly=true&searchForm. NiceOnly=false&searchForm.FavoritedOnly=false&searchForm.SortOrder=Count

Import.io’nun bize sunduğu hizmetlerden biri de internet sitesi tarayıcısı olan Crawler’dır. Kaydedilen bu 20 arama linki ile site tarayıcı aracını kullanarak her bir arama sonucunda beliren 50 başlığın linki elde edilir. Sistem eğit-kullan mantığı ile çalıştığı için bir Crawler eğitilmek üzere 20 linkten biri özelleştirilmiş tarayıcıda açılır ve tekrar eden başlık linklerinden biri seçilir. Sistem verideki sayfalama özelliğinin kullanılıp kullanılmayacağını sorar ve hayır seçerek devam ederiz.

Seçilen başlık verisi için kolon ismi girilir ve kolon tipi olarak link seçilir. Bu sayede sistem başlığın linkini, ismini ve kaynağını taramak zorunda olduğunu bilir. İlk 5 link için sistem bizden bu seçimi doğrulamamızı ister ve artık tarama işleminden önce bir konfigürasyon sayfasını bize sunar. Buradaki arama linki kutusuna taramasını istediğimiz 20 linki yapıştırarak taramayı başlatırız. Tarama sonucunda her bir arama linkinin içindeki 50 şer başlık, toplamda 1000 link olarak, virgülle ayrılmış dosya tipinde(CSV) indirilir.

Örnek başlık linki:

> https://eksisozluk.com/aziz-sancar–1234049?a=nice

İndirilen 1000 adet başlık linkinden aynı yöntemlerle başka bir internet tarama aracı oluşturulur ve başlığın içindeki oylanarak beğenilen ilk 10’ar girdi başlığı, içeriği, tarihi, yazarı ve girdi numarası ile beraber ilgili kolon tipiyle seçilir. Konfigürasyon sayfasında adres kutusuna bir önceki internet taramasında elde edilen girdi linkleri kopyalanarak tarama başlatılır.  Artık hazır olan [eğitim kümesi](https://mevlutcanvar.com.tr/veri-madenciligi-asamalari/309#veri-secimi) için belirlenmiş bu 10.000 girdi virgülle ayrılmış formatta kullanılmak üzere indirilir.

Örnek girdi linki:

> https://eksisozluk.com/entry/7228961

CSV formatında elde ettiğimiz eğitim kümesi verisini MySQL veri tabanına dönüştürmek için Excel için geliştirilmiş [MySQL for Excel](https://mevlutcanvar.com.tr/mysql-for-excel-eklentisi/287) eklentisini kullanmak üzere dosyamızı Excel de açıyoruz. Karşımıza çıkan sihirbaz sayesinde verimizin ne ile ayrıldığını işaretleyip üst bilgisi olduğunu Excel’e bildiriyoruz.

Temsili olarak şekilde gösterilen bu Excel eklentisi sayesinde verimizi bir MySQL veri tabanı içerisinde tablo olarak kaydediyoruz.
