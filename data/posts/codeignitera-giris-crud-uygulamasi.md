---
title: "CodeIgniter'a Giriş: CRUD Uygulaması"
slug: "codeignitera-giris-crud-uygulamasi"
date: "15-04-2016"
---

2015-16 döneminde aldığım Special Topics in Computer Engineering II dersinde php çeşitli uygulamarı yaptık. Sıra çatı(framework) seçimine gelince CodeIgniter basit yapısıyla seçimimiz oldu. Dersin vizesine hazırlanırken çatının içerdiği rotalar ve MVC yapısını kullanarak basit bir CRUD(Oluştur, Oku, Güncelle ve Sil ) işlemleri yapan uygulama geliştirdim. Uygulama öğrenci numarası, isim, soyisim ve cinsiyet bilgilerini tutuyor.

Herhangi bir önyüz giydirmesi ihtiyacı duymayayım diye CodeIgniter’ın welcome_message.php dosyasındaki hoşgeldiniz konteynırını düzenledim. Welcome kontrolcüsündeki(Controller) index fonksiyonunu da düzenledikten sonra aynı hoşgeldin sayfasını alt(footer), üst(header) ve orta kısım(body) olmak üzere üç dosyaya parçaladım. Uygulamayı yaparken url, fom ve database gibi birkaç yardımcı sınıf kullandım. Bu yardımcı sınıfların çeşitli katkıları var sayfaları incelerken bahsedeceğim.

Herşeyi bitirdikten sonra formlarda yer alan girdi(input) elemanlarından alınan veriyi güvanli hale getirdim. Çünkü ne kadar küçük uygulamalar yapsakda XSS açıkları gibi açıları düşünmeden işlemlere yapmak doğru değil. Zaten çatılar bu tür işlerin bütün ameleliğini üstlenip bize birazdan göreceksiniz sadece bir parametre ile ayar yapabilmemizi sağlıyor.

Neler yaptığıma adım adım bakacak olursak işe ilk olarak bahsettiğim gibi görüntüleme(view) dosyalarını parçalamakla başladım. Çünkü bu dosyalar önyüzde sürekli tekrar ederek kullanılmamalı, üst kısımın ve alt kısım çoğu web uygulamasında gezinti boyunca aynı kalır.

Artık kontolcümde(Controller) view yüklerken

<pre>
$this->load->view('welcome_message');
</pre>

yerine

<pre>

public function index()
{
$this->load->helper('url');

		$this->load->view('header');
		$this->load->view('welcome');
		$this->load->view('footer');
}
</pre>

yukarıdaki Welcome kontrolcüsünün index fonksiyonundaki gibi üç ayrı parçayı ard arda yükleyebilirim artık.


<pre>
echo anchor( site_url() . "students/", "Students List Page.");
</pre>

Hoşgeldin sayfama öğrenci listem için link ekleyip kapatıyorum.



<pre>
$route['default_controller'] = 'welcome';
$route['students'] = 'student/list_students';
</pre>

Daha sonra view klasörümdeki welcome.php dosyasını kopyalayıp, ilk hedefim olan listeleme sayfamı yapmak için students.php olarak kaydettim. Student olarak oluşturduğum kontrolcüme gelen url isteklerinin doğrudan /students linkine yönlenerek listeyi görüntülemesini istiyorum. Bunu yapmak için config/routes.php de 2 satır kullandım. Artık oluşturacağım list_students methodu/fonksiyonu students linkine maskelenecek.


<pre>
public function index()
{
redirect('/students');
}

public function list_students()
{
$this->load->model('Student_Model');

$data['students_data'] = $this->Student_Model->list_students();

$this->load->view('header');
$this->load->view('students', $data);
$this->load->view('footer');
}
public function details()
{
$this->load->model('Student_Model');

$id = $this->uri->segment(2);
$data['student_data'] = $this->Student_Model->get_student($id);

$this->load->view('header');
$this->load->view('student', $data);
$this->load->view('footer');
}
</pre>

Kontrolcüme geçerek index, list_students ve details methodlarını oluşturdum. index metodu kontrolcüme gelen doğrudan istekleri /studens uzantısına yönlendiriyor. Bir sonraki methodum oluşturacağım model yardımcısını yükleyip, modelin içindeki list_students() metodundan verileri alıp data nesnesine students_data etiketi ile atıyor ve student önyüzüne(view) parametre olarak iliştirip yüklüyor. Details methodum öncekinden farklı olarak kontrolcümün başlatıcı(constructur) methodunda dahil ettiğim url yardımcısı sayesinde link yapımın /student/ kısmından 2. segmentte olan id yi yakalayıp modelime gönderiyor.


<pre>
public function list_students()
{
if( $query = $this->db->get("student") )
return $query->result();
}

public function get_student($id)
{
$this->db->where('id', $id);
if( $query = $this->db->get("student") )
return $query->result();
}
</pre>

Model dosyamda methodumu oluşturup student tablosundan bütün veriyi geri döndürüyorum. get_student() metodumda ise sorguyu çalıştırmadan önce parametre olarak aldığım id değişkeni ile bir sorgu koşulu oluşturuyorum.


<pre>
					<?php foreach ($students_data as $student): ?>
						<tr>
							<td>
								<?php echo $student->student_id; ?>
							</td>
							<td>
								<?php echo anchor(site_url("student/".$student->id), $student->name); ?>
							</td>
							<td>
								<?php echo anchor(site_url("student/".$student->id), $student->surname); ?>
							</td>
							<td>
								<?php echo $student->gender; ?>
							</td>
							<td>
								<?php echo anchor(site_url("student/delete/".$student->id), "DEL"); ?> -
								<?php echo anchor(site_url("student/edit/".$student->id), "EDIT"); ?>
							</td>
						</tr>
					<?php endforeach; ?>
</pre>


Önyüzde bir tablo yapıp gelen data nesnemi foreach ile listeliyorum. anchor ve site_url methodları yardımı ile ilerde oluşturacağım özellikler için linkler belirliyorum.

<pre>
		<rule name="Rule" stopProcessing="true">
		  <match url="^(.*)$" ignoreCase="false" />
		  <conditions>
			<add input="{REQUEST_FILENAME}" matchType="IsFile" ignoreCase="false" negate="true" />
			<add input="{REQUEST_FILENAME}" matchType="IsDirectory" ignoreCase="false" negate="true" />
			<add input="{URL}" pattern="^/favicon.ico$" ignoreCase="false" negate="true" />
		  </conditions>
		  <action type="Rewrite" url="index.php/{R:1}" appendQueryString="true" />
		</rule>
</pre>

Artık uygulamamı test etmem gerek bunun için GitHub deposunda sizinle paylaştığım student.sql dosyasını import edince gözlemleyeceğiniz gibi 4 kolonlu bir tablo oluşturuyorum. config/database.php dosyasından gerekli ayarlarımı yapıyorum. config/config.php den de site adresini düzenliyorum. Ben php yi ISS de koştuğum için yukardaki web.config sunucu ayar dosyasına site adresimi yeniden yazmasını(rewrite) istiyorum. Aynı konfigürasyonu Apache sunucularda gerçekleştirmek için google araması ile yeniden yönlendirme kurallarına ulaşabilirsiniz.

<pre>
	public function add()
	{
		$this->load->helper('form');

		$this->load->view('header');
		$this->load->view('new-student-form');
		$this->load->view('footer');
	}
	public function insert()
	{
		$this->load->model('Student_Model');

		$data = array(
			'student_id' => $this->input->post('student_id', TRUE),
			'name' => $this->input->post('name', TRUE),
			'surname' => $this->input->post('surname', TRUE),
			'gender' => $this->input->post('gender', TRUE),
			);

			$this->Student_Model->insert_student($data);

			redirect('/students');
	}

	public function delete()
	{
		$this->load->model('Student_Model');

		$id = $this->uri->segment(3);

		$this->Student_Model->delete_student($id);

		redirect('/students');
	}

	public function edit()
	{
		$this->load->model('Student_Model');
		$this->load->helper('form');

		$id = $this->uri->segment(3);
		$data['student_data'] = $this->Student_Model->get_student($id);

		$this->load->view('header');
		$this->load->view('edit-form', $data);
		$this->load->view('footer');
	}
	public function update()
	{
		$this->load->model('Student_Model');

		$data = array(
			'id' => $this->input->post('id'),
			'student_id' => $this->input->post('student_id', TRUE),
			'name' => $this->input->post('name', TRUE),
			'surname' => $this->input->post('surname', TRUE),
			'gender' => $this->input->post('gender', TRUE)
			);

			$this->Student_Model->update_student($data);

			redirect('/students');
	}
</pre>

Listeleme işlemini başarıyla gerçekleştirdikten sonra yukarıdaki gibi kontrolcümün kalan kısımlarını yazıyorum. add() methodunda form yardımcısı ile ekleme formu olan new-student-form.php sayfasını yüklüyorum. insert() methodunda ise bu sayfadaki formdan gelen post isteğini yakalayıp data değişkeni yardımı ile Modelimdeki insert_student metoduna gönderiyorum. Burada değinmem gereken husus ise post methodunun aldığı 2. parametre olan TRUE değeri. Bu sayede çatımıza buradan gelen bilgiyi etiketlerden kurtarmasını söylüyoruz. Örneğin girdiden bize gelen gibi potansiyel zararlı bir içeriği bizim için arındırıp [removed]alert();[removed] şekline dönüştürüyor. Son olarak yapılan işlemler bitince listeleme sayfasına yönlendirme yapıyoruz.

Diğer methodlardaki herhangi bir satıra değinmediğimi düşünmüyorum, sormak istediğiniz bir konu, düzeltmek istediğiniz bir hata varsa lütfen yorum olarak sormaktan çekinmeyin.

<pre>
public function insert_student($data)
{
if ($this->db->insert('student', $data))
return true;
}

public function delete_student($id)
{
$this->db->where('id', $id);
if ( $this->db->delete('student'))
return true;
}

public function update_student($data)
{
$this->db->where('id', $data['id']);
if($this->db->update('student', $data))
return true;
}
</pre>

Model dosyamın geri kalan methodlarını yazıyorum.

<pre>
				$student = $student_data[0];
				echo form_open('student/update');
				echo form_label('Student ID ');
				echo form_input( array('id' => 'student_id', 'name' => 'student_id', 'value' => $student->student_id ) );
				echo "<br>";
				echo form_label('Name ');
				echo form_input( array('id' => 'name', 'name' => 'name', 'value' => $student->name ) );
				echo "<br>";
				echo form_label('Surname ');
				echo form_input( array('id' => 'surname', 'name' => 'surname', 'value' => $student->surname ) );
				echo "<br>";
				echo form_label('Gender ');
				if ( $student->gender === 'Male' )
					$temp = true;
				else
					$temp = false;
				echo form_radio('gender', 'Male', $temp)." Male".form_radio('gender', 'Female', !$temp)." Female";
				echo "<br>";
				echo form_hidden( array('id' => $student->id ) );
				echo form_submit('submit', 'Update Student!');
				echo form_close();
</pre>

edit-form.php önyüz dosyamdaki öğrenci düzenleme formu. CodeIgniter’ın birçok yardımcısı gibi form yardımcısı burada da bize birçok kolaylık sağlıyor. Form nesnelerini methodlar yardımı ile oluşturuyoruz ve özniteliklerini belirliyoruz.

Bütün detay ve içeriği ile olamsa da bu küçük projeyi burada anlatmaya çalıştım. Bu uygulamayı yazarken CodeIgniter‘ın kullanıcı klavuzu çok yardımcı oldu. Gerçekten kolaylıklarını hızlı br şekilde kullanmamız için birçok yardımcı ve çekirdek özellik sunuluyor. Projenin kaynak kodlarını GitHub deposundan indirebilirsiniz. Çatallamak isteyen arkadaşlar klavuzu geliştirmek isterlerse yapılan değişiklikler için gönderiyi güncellemeyi düşünüyorum.
Lütfen yorumunuzu esirgemeyin, iyi çalışmalar dilerim…
