DROP DATABASE IF EXISTS `FootwareAngular`;

CREATE DATABASE `FootwareAngular`;

USE `FootwareAngular`;

CREATE TABLE `Admins` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Password` VARCHAR(255) NOT NULL
);

CREATE TABLE `Clients` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Password` VARCHAR(255) NOT NULL
);

CREATE TABLE `Category` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL
);

CREATE TABLE `Products` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL,
    `Description` TEXT NOT NULL,
    `Price` DECIMAL(10, 2) NOT NULL,
    `CategoryId` INT NOT NULL,
    `IsDeleted` INT NOT NULL,
    `ImageFileName` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`CategoryId`) REFERENCES `Category`(`Id`)
);

CREATE TABLE `Cart` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ClientId` INT NOT NULL,
    `ProductId` INT NOT NULL,
    `Quantity` INT NOT NULL,
    `IsDeleted` INT NOT NULL,
    FOREIGN KEY (`ClientId`) REFERENCES `Clients`(`Id`),
    FOREIGN KEY (`ProductId`) REFERENCES `Products`(`Id`)
);

CREATE TABLE `Checkout` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Phone` VARCHAR(255) NOT NULL,
    `Address` VARCHAR(255) NOT NULL,
    `City` VARCHAR(255) NOT NULL,
    `State` VARCHAR(255) NOT NULL,
    `Zip` VARCHAR(255) NOT NULL,
    `Total` INT NOT NULL,
    `ClientId` INT NOT NULL,
    FOREIGN KEY (`ClientId`) REFERENCES `Clients`(`Id`)
);

CREATE TABLE `Orders` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `CartId` INT NOT NULL,
    `Status` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`CartId`) REFERENCES `Cart`(`Id`)
);

CREATE TABLE `Payment` (
    `Id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `OrderId` INT NOT NULL,
    `Status` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`OrderId`) REFERENCES `Orders`(`Id`)
);