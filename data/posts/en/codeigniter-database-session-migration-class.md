---
title: "CodeIgniter Database Session Migration Class"
slug: "codeigniter-database-session-migration-class"
date: "16/11/2016"
---

This is just the copy of the Turkish one. I would like to share in english because there is some traffic out of my country.

For instance, user guide says us using Codeigniter Framework’s sessions on the database needs below steps:

The ‘database’ driver uses a relational database such as MySQL or PostgreSQL to store sessions. This is a popular choice among many users, because it allows the developer easy access to the session data within an application – it is just another table in your database.

However, there are some conditions that must be met:

Only your default database connection (or the one that you access as $this->db from your controllers) can be used.
You must have the Query Builder enabled.
You can NOT use a persistent connection.
You can NOT use a connection with the cache_on setting enabled.

In order to use the ‘database’ session driver, you must also create this table that we already mentioned and then set it as your `$config['sess_save_path']` value. For example, if you would like to use ‘ci_sessions’ as your table name, you would do this:

```php
    $config['sess_driver'] = 'database';
    $config['sess_save_path'] = 'ci_sessions';
```

And then of course, create the database table …

For MySQL:

```sql
    CREATE TABLE IF NOT EXISTS `ci_sessions` (
            `id` varchar(40) NOT NULL,
            `ip_address` varchar(45) NOT NULL,
            `timestamp` int(10) unsigned DEFAULT 0 NOT NULL,
            `data` blob NOT NULL,
            KEY `ci_sessions_timestamp` (`timestamp`)
    );
```


Of course these sql queries for direct using. If we want to implement it by using CI migration class, here is what should we do:

This is from user guide’s migration section:

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
 

There is up and down methods there. First one using for building, and as you guess the second one for revert back what we builded.

This gist does the same job the above sql query. Here it is:

For make it work this class, we need to create a migration file on the application/migrations folder and name it as ( 001_blabla… ) or ( YYYYAAGGSSDDSS_blabla…). This naming rules from the user guide, you can read the details from there. Alse is a config file on the application/config/migration.php you might want to check.

Finally, this is our the migration controller file:

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
