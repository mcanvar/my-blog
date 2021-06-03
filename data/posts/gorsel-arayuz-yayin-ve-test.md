---
title: "Planlama: 3, 4 ve 5 Görsel Arayüz, Yayın ve Test"
slug: "gorsel-arayuz-yayin-ve-test"
date: "23/09/2016"
---

## Görsel Arayüzün Belirlenmesi



Projenin planlanan ana bölümü bir akışa sahip zaman tüneli şeklinde olacağı için ilk olarak Bootstrap kütüphanesinden istenilen bileşenler belirlenir. Bu tepkisel bileşenler bir araya getirilip basit sade ve amaca uygun olarak birleştirilir. Birleştirilen bu bileşenlerin içleri, test için doldurulur.



Çeşitli tarayıcılarda kısa bir test sürecinden geçirilir ve gerekli düzenlemeler yapılır. JQuery Kütüphanesi’nden yararlanılarak kaydırma çubuğu indikçe içeriğin yüklenmesi özelliği dâhil edilir. Bu sayede proje akışı olan, zamanı takip eden, dinamik bir yapıya kavuşacaktır.
MVC yapısının View kısmında yer almak üzere projeye dâhil edilir. Test için doldurulan içerikler temizlenir ve her bir bileşenin içeriği dinamik karşılığı ile doldurulur.



## Kullanıma Hazır Verinin Yayınlanması
Artık tüm yönleriyle hazır olan projenin ana kısmı çalışmaya hazır konuma gelmiştir ve yayınlanmaya hazırdır. Proje yer aldığı bilgisayar üzerinde çalıştırılarak gerekli bellek ve işlemci sarfiyatı saptanır ve başlangıç şartlarına uygun olarak bir sunucu yaratılır.
Yaratılacak sunucuda proje için gerekli olan ortamlar hazırlanmalıdır. Performans için Linux bir işletim sistemi üzerine bir yönetim sistemi ile beraber; PHP için kendi kütüphane dosyaları ve Apache, veri tabanı için gerekli olan MySQL Server ve bu servisin yönetimi uzaktan yapılacaksa PHPMyAdmin kurulmalıdır.



## Hata Giderme, Güvenlik ve Test Aşaması
Yayınlanan proje çeşitli test araçlarıyla test edilmelidir. Bu aşamada yalnızca görsel hataları değil, projenin inşa aşamasında gözden kaçan noktalarda oluşan açıklar saptanmalıdır.
Sayfaların tepkileri izlenmeli, link düzeni oluşturulmalıdır. Bütün dosya klasörlerin okuma, yazma ve yeniden yazma izinleri gözden geçirilmeli, güvenlik için gereken önlemler .htaccess dosyalarında ele alınmalıdır.
