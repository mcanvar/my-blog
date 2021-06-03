---
title: "Uygulama Metodları: Yazı Ön İşleme"
slug: "uygulama-metodlari-yazi-on-isleme"
date: "30/10/2016"
---

Verimiz artık uygun bir ortamda bulunduğu için [veri madenciliği ön hazırlık süreci](https://mevlutcanvar.com.tr/veri-madenciligi-asamalari#on-isleme-ve-veriyi-temizleme)ne tabi tutulabilir haldedir. Sırasıyla aşağıdaki adımlar izlenerek veri istenilen şekle sokulur.

Gereksiz Girdilerin Silinmesi
=============================

[Veri madenciliği](https://mevlutcanvar.com.tr/eksi-sozlukte-veri-madenciligi) uygulanırken bir getirisi olmayacağını düşünülen girdiler eğitim kümesinden atılmalıdır. Sadece tek kelimeden, bakınız ibaresinden veya linkten oluşan girdiler uygulama alanımıza girmediği için bu aşamada silinmesi gerekir.

Projenin ön yüzündeki internet sayfası Codeigniter PHP çatısı ile gerçekleştirileceği için öncesinde veri madenciliği sürecine katkıda bulunması için bir yönetici paneli tasarlanır ve bu işlemi yapan bir çatı fonksiyonu yapılıp süreç aşaması olarak eklenir.

Fonksiyon yazılırken bu durumları yakalamak için REGEX betik dili ile eşleşmeler sağlanır.

Linklerin Çıkartılması
======================

Girdi metinleri içiresinde yer alan linkle veri madenciliği için bulanıklık yaratırlar. Bu nedenle girdilerin her noktasındaki linkleri temizleyen bir başka fonksiyon yönetici sayfasına eklenir.

Anlamsız Kelimelerin Çıkartılması
=================================

Girdi metinleri içiresinde yer alan, anlam yükü olmayan, özel sözlük ibareleri; edat, bağlaç gibi kelimelerin de sürecin içerisinde yer almaması gerekir. Fakat burada atlanılması gereken kelimeler eş anlamı olup da duygu ağırlığı taşıyabilecek kelimelerdir. Bu işlevi yerine getiren bir başka fonksiyon yönetici sayfasına eklenir.

Duygu İfadelerinin Etiketlenmesi
================================

Girdi yazarları tarafından çeşitli şekillerde noktalama işaretleri ile ya da belirli hece tekrarlarıyla bırakılan gülücük, üzüntü ifadeleri etiketlenerek bütünleştirilir. Kötü hisleri çağrıştıra ifadeler “SADEMOTICON” etiketiyle, iyi hisleri ve mutluluğu ifade edenler ise “HAPPYEMOTICON” etiketi ile değiştirilir. Bu işlemi gerçekleştirmek için ilgili yönetim fonksiyonu yapılır ve yönetici sayfasına aşama olarak eklenir.


<table>
  <tbody>
    <tr>
      <td width="126"><strong>İfade</strong></td>
      <td width="147"><strong>Etiket</strong></td>
      <td width="127"><strong>İfade</strong></td>
      <td width="147"><strong>Etiket</strong></td>
    </tr>
    <tr>
      <td width="126">😮</td>
      <td width="147">SADEMOTICON</td>
      <td width="127">🙂</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
    <tr>
      <td width="126">:/</td>
      <td width="147">SADEMOTICON</td>
      <td width="127">:p</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
    <tr>
      <td width="126">:’(</td>
      <td width="147">SADEMOTICON</td>
      <td width="127">&gt;:(</td>
      <td width="147">SADEMOTICON</td>
    </tr>
    <tr>
      <td width="126">asdas</td>
      <td width="147">SMILEEMOTICON</td>
      <td width="127">eheheh</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
    <tr>
      <td width="126">(:</td>
      <td width="147">SMILEEMOTICON</td>
      <td width="127">♥</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
    <tr>
      <td width="126">):</td>
      <td width="147">SADEMOTICON</td>
      <td width="127">lol</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
    <tr>
      <td width="126">:d</td>
      <td width="147">SMILEEMOTICON</td>
      <td width="127">swh</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
    <tr>
      <td width="126">xd</td>
      <td width="147">SMILEEMOTICON</td>
      <td width="127">haha</td>
      <td width="147">SMILEEMOTICON</td>
    </tr>
  </tbody>
</table>

Çizelge: Belirlenen ifade setinin etiketlenmesi.

Noktalama İşaretlerinin Kaldırılması
====================================

Metin içerisinde yer alan bütün noktalama işaretleri temizlenir. Bu işlemi yapmaktaki amaç bulanıklığı ortadan kaldırmak ve ilerleyen aşamalardaki kelime karşılaştırma işlemlerine kolaylık sağlamaktır. Bu işlemi gerçekleştirmek için ilgili yönetim fonksiyonu yapılır ve yönetici sayfasına aşama olarak eklenir.

Türkçe Karakterlerin İngilizce Karşılıklarıyla Değiştirilmesi
=============================================================

Kelimelerin defalarca karşılaştırılması ve tekillik açısından bu işlemi yapmak araştırmacıya yarar sağlar. Ön işleme çalışmasının son aşaması olarak bu fonksiyon da yazılır ve yönetim paneline işlev olarak eklenir.


<table>
  <tbody>
    <tr>
      <td width="137"><strong>Türkçe</strong></td>
      <td width="137"><strong>İngilizce</strong></td>
      <td width="137"><strong>Türkçe</strong></td>
      <td width="137"><strong>İngilizce</strong></td>
    </tr>
    <tr>
      <td width="137"><strong>ç</strong></td>
      <td width="137">c</td>
      <td width="137"><strong>ö</strong></td>
      <td width="137">o</td>
    </tr>
    <tr>
      <td width="137"><strong>ğ</strong></td>
      <td width="137">g</td>
      <td width="137">ş</td>
      <td width="137">s</td>
    </tr>
    <tr>
      <td width="137"><strong>ı</strong></td>
      <td width="137">i</td>
      <td width="137">ü</td>
      <td width="137">u</td>
    </tr>
  </tbody>
</table>

Çizelge: Dönüştürülen Türkçe karakterler.
