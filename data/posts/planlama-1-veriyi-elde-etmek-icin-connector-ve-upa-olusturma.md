---
title: "Planlama: 1. Veriyi Elde Etmek için Connector ve UPA Oluşturma"
slug: "planlama-1-veriyi-elde-etmek-icin-connector-ve-upa-olusturma"
date: "19/09/2016"
---

Temel olarak aşağıdaki 5 aşamadan oluşan projede planlanan adımların planlanandan önce başarı ile gerçekleştirilmesi durumunda projeye ek özellikler eklenerek devam edilecektir.
Bu başlıktaki(planlama) adımlar karşılaşılan zorluklar veya kolaylıklar karşısında değişiklik gösterebilirler.



Veriyi düzenli ve biçimli bir şekilde elde etmemize olanak sunan import.io aracındaki Connector veri toplayıcısını kullanarak veri toplamak amaçlanmıştır. Oluşturulan Connector’lar istenilen bir arama formunu kullanarak eğitilirler ve sonuç olarak bir UPA(Uygulama Programlama Arayüzü (App Programming Interface)) oluştururlar. Geliştirici bu UPA’yı kullanarak istediği sorgu sonucunu JSON nesnesi olarak elde edebilir. Bu sayede anlık olarak çekilen veriler işlenebilir ve kaydedilebilir.
Connector’ları kullanarak Ekşi Sözlük’te girdi bazında veri çekme işlemleri planlanmaktadır. Planlanan iş sözlükteki HTTP sorgu linklerini çözümleyip bir başlıktaki yeni oluşumu veya uyandırılan bir başlıktaki yeni hareketleri yakalamaktır.
Örneğin:

`eksisozluk.com/veri-madenciligi--723393?a=nice`

URL’sindeki sorgu etiketi ile bir başlıkta yer alan girdiler en çok pozitif(şükela oyu) oy alandan en aza kadar sıralanır ve görüntülenir. Bunun yanında aynı etiketin bir başka sorgu tipi de “?a=popular” dır. Bu sorgu etiketi ile de başlık gündem de mi değil mi sorusuna yanıt bulunabilir. Bir başka sorgu URL’si ise “?day=” dir. İstenilen gün içerisinde başlığa girilen girdileri listeler. “/veri-madenciligi–723393?a=nice&day=2015-11-07” sorgusu ile başlığa 7 Ekimde girilen girdiler, en çok beğeni alandan başlayarak sıralanır.


Proje amacına uygun Connector, Extractor ve gerektiğinde projeye ekstra özellikler katmak için Crawler’lar bu adımda belirlenir ve gerçekleştirilir. Gerekli düzenlemeler yapılır, çeşitli PHP sayfaları yaratılır ve test edilirler.



Örneğin aşağıdaki kod parçacığı ile import.io sunumsal UPA’sı kullanılarak dinamik olarak yazarın profil sayfası ve son yazdığı girdiler sıralanır:

```html
<label>Kullanıcı Adı: <input type="text" ng-model="nickname" /></label><br />
<iframe height="100%" width="100%" src="https://api.import.io/store/connector/49aa65b5-3194-4419-9268-df74b04b3be9/ _query?format={JSON}&input=nickname:@{{nickname}}&_user=329e4ce0-bd9c-4f2b-8253-95b460be7da4&_apikey=329e4ce0bd9c4f2b825395b460be7da4313ad72 5d0a780b98181f26502c18fb2b37d6c2f701f71c0c22bd6976fc1ad77fd9d55a2a8c129732ea0a8f5660ff5e26c1f19f76838a257200dd7f91154511a"></iframe>
```
