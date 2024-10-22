-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tienda_apc
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `direccion_id` int DEFAULT NULL,
  `direccion_temporal` varchar(255) DEFAULT NULL,
  `telefono_temporal` varchar(20) DEFAULT NULL,
  `metodo_pago` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `pedidos_ibfk_2` (`direccion_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,NULL,969.00,'2024-09-19 16:17:26',NULL,'bxbxb','xcbxcb','paypal'),(2,NULL,969.00,'2024-09-19 16:23:47',NULL,'dfbdcb','dfbfdb','paypal'),(3,NULL,969.00,'2024-09-19 21:50:36',NULL,'fbcb','dfbdfb','paypal'),(4,NULL,969.00,'2024-09-19 23:24:26',NULL,'eccec','ecece','paypal'),(5,NULL,969.00,'2024-09-19 23:43:58',NULL,'vbcvb','cvbcvb','paypal'),(6,NULL,969.00,'2024-09-19 23:58:01',NULL,'fhfh','zcz','paypal'),(7,NULL,969.00,'2024-09-20 00:11:51',NULL,'dgbdfb','dfbdfb','paypal'),(8,NULL,969.00,'2024-09-20 00:19:12',NULL,'vxzvx','xcvxcv','paypal'),(9,NULL,969.00,'2024-09-20 00:21:22',NULL,'xvv','xvv','paypal'),(10,NULL,969.00,'2024-09-20 00:32:36',NULL,'jgfhg','xzczcx','paypal'),(11,NULL,969.00,'2024-09-20 00:47:21',NULL,'dvxv','vxcvcx','paypal'),(12,NULL,969.00,'2024-09-20 00:48:06',NULL,'zvczxc','zxcxzc','paypal'),(13,NULL,969.00,'2024-09-20 01:05:35',NULL,' vzczx','czxcxzc','paypal'),(14,NULL,969.00,'2024-09-20 01:14:07',NULL,'cdczds','czcz','paypal'),(15,NULL,969.00,'2024-09-20 01:25:34',NULL,'adda','asdasd','paypal'),(16,NULL,969.00,'2024-09-21 00:09:36',NULL,'nnvn','vbnvbnv','paypal'),(17,NULL,969.00,'2024-09-21 00:28:18',NULL,'jhvhj','hjvhj','paypal'),(18,NULL,969.00,'2024-09-21 00:44:36',NULL,'xvxv','xdvxdvxd','paypal'),(19,NULL,969.00,'2024-09-21 13:10:59',NULL,'zczxcz','cxzxzc','paypal'),(20,NULL,969.00,'2024-09-21 13:18:17',NULL,'vzcz','zxczxc','paypal'),(21,NULL,969.00,'2024-09-21 13:29:53',NULL,'vxcvx','xcvcxv','paypal'),(22,NULL,969.00,'2024-09-21 13:58:24',NULL,'vszv','cxvxcvcv','paypal'),(23,NULL,969.00,'2024-09-21 14:20:24',NULL,' xcxcxc','xcvxcv','paypal'),(24,NULL,969.00,'2024-09-21 14:32:44',NULL,'zdvxzv','xcvcxv','paypal'),(25,NULL,969.00,'2024-09-21 15:27:25',NULL,'asdas','adsdas','paypal'),(26,NULL,969.00,'2024-09-21 15:29:15',NULL,'zdvcd','zvdvd','paypal'),(27,NULL,969.00,'2024-09-21 15:31:21',NULL,'scascasc','ascsacasc','paypal'),(28,NULL,969.00,'2024-09-21 15:38:05',NULL,'hfgfj','sdvsdsdv','paypal'),(29,NULL,969.00,'2024-09-21 22:07:12',NULL,'cszzsc','zsczsc','paypal'),(30,NULL,969.00,'2024-09-21 23:35:09',NULL,'vxcxcv','xvcxv','paypal'),(31,NULL,969.00,'2024-09-21 23:35:30',NULL,'zxc','zxcxzczx','paypal'),(32,NULL,969.00,'2024-09-21 23:50:10',NULL,'vxvcx','xcvxcv','paypal'),(33,NULL,969.00,'2024-09-22 00:01:04',NULL,'xczzxcxz','xcxzc','paypal'),(34,NULL,969.00,'2024-09-22 00:04:25',NULL,'czczx','zxczxc','paypal'),(35,NULL,969.00,'2024-09-22 00:08:08',NULL,'adsadsa','dsaadas','paypal'),(36,NULL,969.00,'2024-09-22 00:12:34',NULL,'czdczdxcz','zczxc','paypal'),(37,NULL,969.00,'2024-09-22 00:27:08',NULL,'bfbxcb','cvbvcb','paypal'),(38,NULL,969.00,'2024-09-22 00:37:26',NULL,'dfdf','fbfbddfb','paypal'),(39,NULL,969.00,'2024-09-22 01:07:19',NULL,'vcxcvcx','vxcvxv','paypal'),(40,NULL,969.00,'2024-09-22 01:16:38',NULL,'vxvxcvcxvcx','xvcxcvx','paypal'),(41,NULL,969.00,'2024-09-22 01:29:41',NULL,'czxczc','zxcxzc','paypal'),(42,NULL,969.00,'2024-09-22 01:36:10',NULL,'czxzccxz','zcxxzczcx','paypal'),(43,NULL,969.00,'2024-09-22 01:38:52',NULL,'zxcczx','xzczxc','paypal'),(44,NULL,969.00,'2024-09-22 01:44:45',NULL,'xZczxcxz','xczcz','paypal'),(45,NULL,969.00,'2024-09-22 01:48:01',NULL,'sdfsdfs','sdfdsfds','paypal'),(46,NULL,969.00,'2024-09-22 01:55:00',NULL,'xzczczxc','xczxczxzc','paypal'),(47,NULL,969.00,'2024-09-22 20:22:51',NULL,'dvxvc','cxvcvx','paypal'),(48,NULL,969.00,'2024-09-22 20:23:35',NULL,'xzczcx','xzccxz','paypal'),(49,NULL,969.00,'2024-09-22 23:23:21',NULL,'Eguzki Auzoa, N6, 1D','601118606','paypal'),(50,NULL,969.00,'2024-09-25 23:20:13',NULL,'czx','cxzcxz','paypal'),(51,NULL,969.00,'2024-09-25 23:21:07',NULL,'zczc','cxzcxzc','paypal'),(52,NULL,1938.00,'2024-09-26 00:26:38',NULL,'zxcxzc','ccxzcz','paypal'),(53,NULL,969.00,'2024-09-27 17:38:07',NULL,'xcvcxvcx','cxvxcvxc','paypal'),(54,NULL,969.00,'2024-09-27 18:29:29',NULL,'cvcxvcx','vxc','paypal'),(55,NULL,969.00,'2024-09-27 19:59:23',NULL,'sdfsdf','fdsfsdf','tarjeta'),(56,NULL,969.00,'2024-09-27 20:04:31',NULL,'xcvxvx','xcvxcv','tarjeta'),(57,NULL,969.00,'2024-09-27 20:27:22',NULL,'xcvxcv','xcvcxvcx','tarjeta'),(58,NULL,969.00,'2024-09-27 20:34:46',NULL,'rgrb','rtbrbr','tarjeta'),(59,NULL,969.00,'2024-09-27 22:54:56',NULL,'vxvxcvcxv','vcxvccxv','tarjeta'),(60,NULL,1219.00,'2024-09-29 16:01:23',NULL,'vxcvxcv','xcvvxcv','tarjeta'),(61,NULL,969.00,'2024-10-03 02:34:29',NULL,'ascsa','ascsa','tarjeta'),(62,NULL,1219.00,'2024-10-03 02:45:16',NULL,'sdff','fdsfdsf','tarjeta');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-05 18:39:10
