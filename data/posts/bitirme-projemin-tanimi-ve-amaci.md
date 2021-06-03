---
title: "Bitirme Projemin Tanımı ve Amacı"
slug: "bitirme-projemin-tanimi-ve-amaci"
date: "17/09/2016"
---

Projenin başlangıç sürümünden hedeflenen; tam tepkisel ana sayfada bir zaman tüneli barındırması ve bu sayfada bir analiz butonu ile tetiklenen kayan pencerenin belirmesi ile kullanıcının buraya yazacağı girdi numarası alınır.

Alınan bu girdi numarası Java tabanlı Spring MVC Çatısı kullanılarak gerçekleştirilmiş internet servisine analiz edilmek üzere iletilir. Makine öğrenmesi ile gerçekleştirilen veri madenciliği algoritmasından bu sayede analizi gerçekleştirilen girdi duygu etiketi eklendikten sonra isteğe cevaben Json dosyası formatında iletilir. Bu şekilde analizi gerçekleşen girdiler zaman tüneli kuyruğuna eklenir.
Projenin internet sitesi için veri tabanı yapısı MySQL Workbench yardımı ile kurulur. Önyüz için kullanılacak olan PHP çatısı olan Codeigniter, projenin veri madenciliği süresince ihtiyaç duyulan işlemleri de kendi bünyesinde tutar. İnternet sitesi de internet servisi hazır olduktan sonra aynı çatı tarafından gerçekleştirilir.
Veri madenciliği yöntemleri kullanarak seçilen algoritmaya göre elde ettiğimiz ağaç yapısı, fonksiyon veya formüller’ i kullanarak, gelen girdi numarası sayesinde elde ettiği ham girdi bilgisini kütüphaneler yardımı ile işleyip, algoritmadan geçirip JSON verisi formatında geri döndüren Spring MVC çatısı ile bir internet hizmeti gerçekleştirilir.

İnternet sitesi için gereken Apache tabanlı ortam Linux tabanlı bir işletim sistemine kurulur. İnternet sitesi burada yayınlanır. İnternet servisi için gerekli olan Tomcat bir Linux tabanlı işletim sistemine kurulur ve yayınlanır.



Temel amacının kullanıcılarına daha sade bir arayüz ile gereksiz içerik yığınından arındırılmış, gruplanmış ve duygu imleriyle işaretlenmiş veriyi sunmak olduğu bu projenin gerçekleştirilme gerekçeleri;
1. Kısıtlı zamanlarda sözlükteki dinamik bilgi akışından faydalanmak isteyen insanlara hızlıca ulaşabileceği girdiler sunmak.
2. Sözlüğün karabalık ve yetişkin içerikten arındırılmamış bu halini kullanmak istemeyen kullanıcılara daha sade ve arındırılmış bir içerik sunmak.
3. Kullanıcıların bilgi almak istedikleri başlıklarda daha güvenilir, laf karabalığından uzak bilgilere kolaylıkla erişmesine imkân tanımak.
4. Duygu analizi ile seçilmiş girdilerin analizini yapmak ve kullanıcıya kategorik olarak sunmak.
5. Yetişkin içeriğe sahip sözcük ve cümleleri direkt olarak yayınlamak yerine, görüntülenmesini kullanıcının seçimine sunmak.
6. Bütün bu hizmetlere platform bağımsız olarak, tepkisel bir arayüz ile bütün cihazlardan ulaşabilmek.
7. Sözlük kullanıcılarının ihtiyaçları doğrultusunda yeni modüller geliştirmek ve hizmete sunmak.
