CREATE DATABASE IF NOT EXISTS final_project_db;
use final_project_db;



CREATE TABLE IF NOT EXISTS user
(name  varchar(100), 
email_id  varchar(100) primary key, 
phone long, 
role  varchar(100));

CREATE TABLE IF NOT EXISTS projects
(project_name varchar(100), 
project_id varchar(100) primary key, 
project_desc varchar(1000), 
owner_email varchar(100));

CREATE TABLE IF NOT EXISTS user_projects
(email_id varchar(100),
project_id varchar(100));
