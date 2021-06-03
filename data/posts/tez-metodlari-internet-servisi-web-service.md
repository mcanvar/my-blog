---
title: "Tez Metodları: İnternet Servisi (Web Service)"
slug: "tez-metodlari-internet-servisi-web-service"
date: "18/11/2016"
---

İnternet Servisleri HTTP protokolü üzerinden hizmet veren fonksiyonlar bütünüdür. Bir kullanıcının HTTP üzerinden bir web servisi kullanmasına denmektedir. HTPP üzerinden yapılan bu çağrımlara karşı sistem XML veya JSON çıktıları üretir.

Veri transferi bu çıktılar sayesinde yapıldığı için platform bağımsız bir yapısı vardır. Bu sayede servisi kullanmak istediğiniz program parçasının hangi dilde yazıldığının pek bir önemi kalmamaktadır.

REST Servis ise istemci ile sunucu arasındaki iletişimi HTTP protokolüyle kolay ve hafif (lightweight) bir şekilde sağlanmasına olanak veren bir yapıdır. REST 2000 yılında Roy Fielding tarafından doktora tezi olarak ortaya atılmıştır. REST yapısıyla sunulan servislere RESTful Servis denir.

RESTful servislerin amacı temelde sunucu ve istemci arasındaki veri alışverişini platform bağımsız ve olabilecek en az veri yüküyle sağlamak olduğundan Json, HTML, XML gibi birçok cevap tipiyle çalışabilmektedir. Json dosya formatının yaygın hale gelmesiyle mevcut veri bu servis tipiyle beraber daha az boyutlu halde taşınabilir hale gelmiştir.

- Bir servisin, RESTful sıfatını kazanabilmesi için aşağıdaki koşulları sağlaması gerekmektedir:
- İstemcilerin sunucu tarafında herhangi bir içyapıyı bilmemesi, sunucuların da istemci hakkında kullanıcı arabirimini veya durumunu bilmemesi gibi, her iki yapının da birbirinden tamamen bağımsız, ancak ortak bir arayüz ile iletişimini sağlayabilmesi.
- İstekler esnasında sunucuda istemci ile ilgili bir bilginin tutulmamasıdır. RESTful servis, istemcilerin istekleri esnasında gönderdiği bir kimlik bilgisi veya benzeri ayırıcı bilgi ile ayırımını yapar ve ilgili yanıtı kendisine gönderebilmesi.
- Standart HTTP işlemlerini desteklemesi.
