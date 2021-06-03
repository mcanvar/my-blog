---
title: "Uygulama Metodları: Eğitim Kümesinin İşaretlenmesi"
slug: "/uygulama-metodlari-egitim-kumesinin-isaretlenmesi"
date: "02/12/2016"
---

Uygulama Metodları: Eğitim Kümesinin İşaretlenmesi
========================================
Ön işleme işleminin bitmesiyle elde edilen girdi kümesi artık veri madenciliği süreci içerisinde olduğu için algoritmalar ile gerçekleştirilecek olan makine öğrenmesi için kullanılacaktır. Bu algoritmalar girdilerin insan gözüyle işaretlenmiş halini kullanarak bize sonuçlar üretirler.

Veri tabanındaki kolonların sonuna bir analiz kolonu eklenerek tipi enum seçilir. Alabileceği değer olarak ‘h’ harfi ile mutluluğu, ‘u’ ile mutsuzluğu ve ‘n’ ile de duygu ağırlığı nötr olan kelimeleri ifade eder. Bu gereksinimi karşılamak için büyük verilerle çalışırken bir kullanıcı arayüzü yapmak gereklidir. Çünkü araştırmacı bu adımda yapması gerekenleri kendi başına yaparsa zaman kaybına uğrayabilir.

Projede kullandığımız Bootstrap önyüz çatısının bize sağladığı elemanlarla bir arayüz tasarlanır ve zaman tüneli şekline getirilir. Her bir girdi bir liste elemanı içerisinde sözlüğe eklenme tarihine göre sıralı olarak, alt kısmında yer alan 3 butonla beraber listelenir. Araştırmacıya yardım etmek isteyenler bu butonlar yardımıyla AJAX istekleri göndererek girdileri işaretleyebilirler. İşaretlenen girdiler tekrar zaman tünelinde görünmezler.

Bu arayüzü gerçekleştirmek için önyüz yaratılması gerektiği için kullanmak üzere Bootstrap Pastel teması seçildi ve temanın kaynak dosyaları proje ana klasöründe oluşturulan assets klasörü içine kopyalandı. Temel görünüm olarak üst kısıma sabit bir navigasyon çubuğu, solda bir yan menü sağ kısmında zaman tüneli şeklinde akışa sahip bir içerik alanı oluşturuldu.


Bu çalışmada işaretleme sürecinde araştırmacıya yardım eden insanlarla beraber toplamda 7869 girdi okunarak değerlendirilmiş ve bunlardan %25.40’ı (1999) mutsuz, %28.56’sı (2247) mutlu ve %46.04’ü ise (3623) nötr olarak işaretlenmiştir.
