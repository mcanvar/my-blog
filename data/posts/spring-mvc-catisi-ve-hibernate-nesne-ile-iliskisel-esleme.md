---
title: "Spring MVC Çatısı ve Hibernate Nesne ile İlişkisel Eşleme"
slug: "spring-mvc-catisi-ve-hibernate-nesne-ile-iliskisel-esleme"
date: "19/10/2016"
---

Spring MVC Çatısı ve Hibernate Nesne ile İlişkisel Eşleme
========================================
Spring MVC, Spring Çatısı’nın internet tabanlı bileşenidir. Güçlü internet(web) uygulamaları geliştirmek için birçok fonksiyonellik sunar.

Bu çatı tasarlanırken yapıyı oluşturan her bir parçanın yüksek derecede yapılandırılabilir olmasına dikkat edilmiştir. Ayrıca diğer popüler web çatılarıyla ( Struts, WebWork, Java Server Faces ve Tapestry) entegre edilebilmektedir.

Bir diğer güçlü özelliği de kullanıcıya görüntü sunmak için servlet ve jsp kullanma zorunluluğunun olmamasıdır. Velocity, Freemarker, Excel veya Pdf gibi görüntü sunma teknolojileri de kullanılabilmektedir. Bu çatıyı kullanırken kendisinin sunduğu herhangi bir arayüzü içerme zorunluluğumuz yoktur.

Spring MVC Çatı’sı diğer çatılar gibi istek bazlı çalışmaktadır. Burada merkezi bir Java sunucu uygulaması (servlet) bulundurmakta ve bu uygulamaya gelen istekleri kontrolcülere yönlendirmektedir.

Spring MVC deki bir isteğin yaşam döngüsü aşağıdaki adımlardan oluşmaktadır.

1. İstemci sunucuya HTTP tipinde bir istek gönderir.
2. Gelen istek öncelikle ön kontrolcü (DispatcherServlet) tarafından karşılanır ve uygun anahtarlamaları (Handler Mappings) bulmaya çalışır.
3. Anahtarlama yardımıyla ön kontrolcü isteği uygun kontrolcüye gönderir.
4. Kontrolcü isteği işlemeye çalışır ve ön kontrolcüye (FrontController) görünüm ve model (ModelandView) nesnesini döndürür.
5. Ön kontrolcü bu gönderilen nesneyi görüntü çözümleyici (View Resolver) kullanarak çözümler ve kullanıcıya sunulmak üzere bir görüntü oluşturur.
6. Daha sonra oluşturulan sayfa kullanıcıya sunulur.

Spring Java 5’i desteklemektedir. Buda bize Java ek açıklamalarını (Annotations) kullanarak yapılandırma yapma özelliği sunmaktadır. Ayrıca Java 5’in birçok özelliği burada kullanılabilmektedir. Spring REST İnternet Servislerini desteklemektedir.

Hibernate, Java platformunda yazılmış bir nesne ilişkisel eşleme aracıdır. NİE(Object Relational Mapping), nesne odaklı (object oriented) dillerdeki nesnelerin, ilişkisel veri tabanlarındaki (relational databases) kayıtlara nasıl karşılık geldiğini yürüten bir teknolojidir.

Hibernate gibi NİE araçlarıyla, bir nesneyi veri tabanına kaydetmek, yeni halini güncellemek ve sorgulama yapmak düz SQL bağlantılarına göre çok kolaydır.

Örneğin klasik yöntem ile:

```
stmt.executeUpdate( "INSERT INTO KAHVE VALUES ('Colombian', 101, 7.99, 0, 0)");
```
şeklinde yazılan işlem, Hibernate sayesinde nesneler ile:

`session.saveOrUpdate(kahve);`

şeklinde yapılabilir.
