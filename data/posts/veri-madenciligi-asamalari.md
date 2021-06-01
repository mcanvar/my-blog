---
title: "Veri Madenciliği Aşamaları"
slug: "veri-madenciligi-asamalari"
date: "29-10-2016"
---

Veri madenciliği çeşitli adımlardan oluşur ve bu adımlar sayesinde bir süreç olarak sonuca varır. Veri kaynağından alınan ham veriden algoritmaya giden yolda veri; temizlenir ve indirgenir.

Daha sonrasında [veri madenciliği](https://mevlutcanvar.com.tr/veri-kavrami-ve-madenciligi) metotları uygulanarak çeşitli bulgular elde edilir.

Bu bulgular yorumlanarak kararlar alınır.

Son aşamada görünen veririnin beklentileri en iyi şekilde karşılaması için bütün bu adımlar her noktasıyla ele alınmalı ve titiz bir şekilde uygulanmalıdır.

### [Veri Seçimi](#veri-secimi)

[Veri seçimi](https://mevlutcanvar.com.tr/import-io-ozellestirilmis-tarayicisi) aşaması çözüm sağlanması planlanan problemle ilişkili olmalı ve iyi analiz edilmelidir. Sonraki bütün aşamalar bu seçim üzerinden yürüyeceği için önemlidir ve doğrudan araştırmacının sorumluluğundadır.

### [Ön İşleme ve Veriyi Temizleme](#on-isleme-ve-veriyi-temizleme)

Veri madenciliğinin bu aşamasına verinin tutarsız ve gürültülü olduğu durumlarda ihtiyaç duyulur. Gürültülü veri, amaca uygun bilgi barındıran fakat bu bilgiyi elde etmeyi zorlaştırıcı unsurlar taşıyan anlamındadır. Temizlenmesi gereken veri temizlenmeli, eksik kalan verinin yerine yenisi konulmalıdır. Eksik veri, veri kümesinden atılabilir, kayıp değerler yerine genel bir sabit kullanılabilir, kayıp yerine ortalama konulabilir veya tahmin yapılabilir.

Bu aşamada veri sonraki adımlar için uygun hale getirildiği için süreci doğrudan etkilemektedir. Başarılı bir ön işleme işlemi güvenilir sonuçlar elde etmeyi temin eder.

### [Veriyi İndirgeme](#veriyi-indirgeme)

Büyük veri setlerinde veri madenciliği çalışmaları yapılırken veriyi ele almak maliyetli olabilir. Bu gibi durumlarda sonuca etkisinin önemsenmeyecek kadar az olduğunu düşündüğümüz veri veya değişkenlerin sayısı azaltılabilir.

### [Veriyi Bütünleştirme](#veriyi-butunlestirme)

Farklı farklı kaynaklardan alınan verilerin [veri ambarı](https://mevlutcanvar.com.tr/veri-ambari) na aktarılma durumunda aynı verinin birden fazla şekilde ifade edilebilmesi nedeniyle ikilemler oluşur.

Bu ikilemleri ortadan kaldırmak için tek türe bütünleştirmeler yapılmalıdır.

Örneğin: Farklı veri tabanı yönetim sistemlerinden veri ambarına gelen kayıtlardaki cinsiyet kayıtlarının “E”, “Erkek”, “Male”, gibi kayıtların “M” şekline bütünleştirilmesi.

### [Veriyi Dönüştürme](#veriyi-donusturme)

Veriyi bazı durumlarda veri madenciliği çözümlemelerine aynen katmak uygun olmayabilir. Değişkenlerin ortalama ve varyansları birbirlerinden önemli ölçüde farklı olduğu takdirde büyük ortalama ve varyansa sahip değişkenlerin diğerleri üzerindeki baskısı daha fazla olur ve onların rollerini önemli ölçüde azaltır.

Ayıca değişkenlerin sahip olduğu çok büyük ve çok küçük değerler de çözümlemelerin sağlıklı biçimde yapılmasını engeller. Bu nedenle bir dönüşüm yöntemi uygulayarak söz konusu değişkenlerin normalleştirilmesi veya standartlaştırılması uygun bir yol olacaktır.

### [Veri Madenciliği Aşaması](#veri-madenciligi-asamasi)

Sürecin bu adımında önceki adımlarda hazırlanan veri kullanılarak çalışmanın amacına göre veri madenciliği yöntemleri uygulanır. Bu yöntemler çeşitli algoritmalar yardımıyla gerçekleşir, her algoritmanın kendine has veri giriş ve çıkışı gibi karakteristik özellikleri vardır.

### [Yorumlama ve Doğrulama](#yorumlama-ve-dogrulama)

Yöntemlerden elde edilen sonuçlar karşılaştırılır ve yorumlanır. Genelde çalışma için yöntem seçiminde en başarılı olma ve kolay uygulanabilirlik baz alınır.
