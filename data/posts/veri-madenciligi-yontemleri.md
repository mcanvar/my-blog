---
title: "Veri Madenciliği Yöntemleri"
slug: "veri-madenciligi-yontemleri"
date: "02-11-2016"
---

Birçoğu istatistiksel olmak üzere bu yöntemler bünyelerinde çok sayıda algoritma barındırmaktadırlar. Sınıflandırma, Kümeleme ve Birliktelik Kuralları olarak 3 ana grupta ele alınırlar.  


### [Sınıflandırma](#siniflandirma)

Veriler arasındaki gizli örüntüleri ortaya çıkararak incelememize imkân tanırlar. Sıkça kullanılan yöntemdir. Var olan veri tabanının bir kısmını eğitim kümesi olarak kullanarak sınıflandırmayı gerçekleştirirler. Oluşan kurallar yardımıyla yeni bir durum meydana geldiğinde nasıl davranılması gerektiği belirlenir.

[Veri kavramı](https://mevlutcanvar.com.tr/veri-kavrami-ve-madenciligi) nın oluşumundan bu yana hep sınıflandırmaya ihtiyaç duyduğumuzdan dolayı sınıflandırma veri madenciliğinin temeli olarak görülür.  
Veri madenciliğinde sınıflandırma için kullanılan yöntemler şöyledir:

1.  Örnek tabanlı yöntemler
2.  Genetik Algoritmalar
3.  Destek Vektör Makineleri
4.  Bulanık Küme Sınıflandırıcılar
5.  Öngörü

Destek Vektör Makineleri (DVM) yönteminde hem doğrusal olarak ayırt edilebilen hem de edilemeyen veri kümeleri sınıflandırılabilir. Doğrusal olmayan bir eşlem ile n boyutlu veri kümesi m > n olacak şekilde m boyutlu yeni bir veri kümesine dönüştürülür. Yüksek boyutta doğrusal sınıflandırma işlemi yapılır.

Uygun bir dönüşüm ile her zaman veri bir hiper düzlem ile iki sınıfa ayrılabilir. Hiper düzleme en yakın öğrenme verileri destek vektörleri olarak adlandırılır. DVM için en yaygın eniyileme algoritmaları SMO ve SVMlight algoritmalarıdır.  


### [Kümeleme](#kumeleme)

Kümeleme birbirlerine benzeyen veri parçalarım ayırma işlemidir ve kümeleme yöntemlerinin çoğu veri arasındaki uzaklıkları kullanır. Örneğin Öklid, Manhattan ve Minkowski uzaklık bağıntıları kümeleme işleminde alt işlem olarak kullanılmaktadır.

Kümeleme yöntemleri arasında akla ilk en yalan komşu algoritması ve en uzak komşu algoritması gelmektedir; bunlar hiyerarşik kümeleme yöntemleri olarak da bilinir. Hiyerarşik olmayan kümeleme yöntemleri arasında k-ortalamalar yöntemi sayılabilir.  


### [Birliktelik Kuralları](#birliktelik-kurallari)

Bir arada gerçekleşen olayları çözümlemek [veri madenciliği](https://mevlutcanvar.com.tr/veri-madenciligi-asamalari/#veri-madenciligi-asamasi) nin kapsamı içine girmektedir. Olayların birlikte gerçekleşme durumlarını çözümleyen veri madenciliği yöntemlerine birliktelik kuralları (association rules) adı verilmektedir. Bu yöntemler, birlikte olma kurallarını belirli olasılıklarla ortaya koyar.

Birliktelik çözümlemelerinin en yaygın uygulaması perakende satışlarda müşterilerin satın alma eğilimlerini belirlemek amacıyla yapılmaktadır. Müşterilerin bir anda satın aldığı tüm ürünleri ele alarak satın alma eğilimini ortaya koyan uygulamalara “pazar sepet çözümlemesi” adı verilmektedir.
