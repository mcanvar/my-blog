---
title: "CodeIgniter Database Session Migration Class"
slug: "codeigniter-database-session-migration-class"
date: "22/09/2016"
---

CodeIgniter‘ın bize sunduğu performans, kendisini sık olarak orta ölçekli projeler geliştirirken kullanmamızı sağlıyor. Bu tarz projelerde ortak çalışmalar veritabanı değişikliği ile sık sık aksayabiliyor. Bunları aşmak için migration sınıflarını kullanarak veritabanını uygulamada geliştirilen kısımlarla beraber güncel tutabiliyoruz ve bu geliştiriciler için bir çok baş ağrısını bir kenara bıraktırıyor…

Ions Auth gibi bir kütüphaneyi projemize dahil edip kullanmaya başladığımızı düşünürsek, hem kütüphanenin hem de CodeIgniter’ın session’larının kayıt altına alınması için veritabanı seçmemiz gerekiyorsa (ki bu yolu seçmemiz için birçok neden var), migration sınıflarına ihtiyaç duyuyoruz.

Konumuz bu olmasa da CI kullanıcı oturumlarını veritabanı üzerinden işlemek için aşağıdaki iki konfigrasyonu config/config.php üzerinden yapmamız gerekiyor:

```php
$config['sess_driver'] = 'database';
$config['sess_save_path'] = 'ci_sessions';
```

Daha sonra eğer migration kullanmaya ihtiyaç duymuyorsak aşağıdaki sorguyu Mysql üzerinden çalıştırıyorduk:

```sql
CREATE TABLE IF NOT EXISTS `ci_sessions` (
`id` varchar(40) NOT NULL,
`ip_address` varchar(45) NOT NULL,
`timestamp` int(10) unsigned DEFAULT 0 NOT NULL,
`data` blob NOT NULL,
KEY `ci_sessions_timestamp` (`timestamp`)
);
```

CodeIgniter User Guide’ında örnek olarak verilen migration sınıf yapısı ise şöyle:

```php
<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_blog extends CI_Migration {

        public function up()
        {
                $this->dbforge->add_field(array(
                        'blog_id' => array(
                                'type' => 'INT',
                                'constraint' => 5,
                                'unsigned' => TRUE,
                                'auto_increment' => TRUE
                        ),
                        'blog_title' => array(
                                'type' => 'VARCHAR',
                                'constraint' => '100',
                        ),
                        'blog_description' => array(
                                'type' => 'TEXT',
                                'null' => TRUE,
                        ),
                ));
                $this->dbforge->add_key('blog_id', TRUE);
                $this->dbforge->create_table('blog');
        }

        public function down()
        {
                $this->dbforge->drop_table('blog');
        }
}
```

Bu yapıyı göz önüne alarak yazdığım sınıf ise burada, (eklemek yada düzeltmek istediğiniz birşey varsa lütfen yorum yapmaktan çekinmeyin):

Bu migration sınıfını çalıştırmak için application/migrations klasöründe ister versiyon numarası ile ( 001_blabla… ) isterseniz tarih formatı ile ( YYYYAAGGSSDDSS_blabla…) kaydedip, aşağıdaki gibi bir kontrolcü yardımı ile tetiklememiz gerekiyor. Tabiki migration sınıfının da bir ayar dosyası bulunuyor ( config/migration.php ), buradan istediğiniz formatı kullanabilirsiniz. Ayrıca otomotik olarak son versiyon dosyanın tetiklenmesini veya hangi versiyonun kullanılması gerektiğini belirtebilirsiniz.

```php
<?php

class Migrate extends CI_Controller
{

        public function index()
        {
                $this->load->library('migration');

                if ($this->migration->current() === FALSE)
                {
                        show_error($this->migration->error_string());
                }
        }

}
```
