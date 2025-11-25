use gestion_test;

CREATE TABLE Users (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_Email VARCHAR(255) UNIQUE NOT NULL,
    User_Password VARCHAR(255),
    User_Role ENUM('client', 'worker','manager', 'admin') NOT NULL
);

CREATE TABLE Clients (
    Client_ID INT AUTO_INCREMENT PRIMARY KEY,
    Client_LastName VARCHAR(255) NOT NULL,
    Client_FirstName VARCHAR(255) NOT NULL,
    Client_Address TEXT NOT NULL,
    Client_Phone VARCHAR(20) NOT NULL,
    Client_HourlyRate DECIMAL(10, 2),
    User_ID INT NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE Workers (
    Worker_ID INT AUTO_INCREMENT PRIMARY KEY,
    Worker_LastName VARCHAR(255) NOT NULL,
    Worker_FirstName VARCHAR(255) NOT NULL,
    Worker_Address TEXT NOT NULL,
    Worker_Phone VARCHAR(20) NOT NULL,
    User_ID INT NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Appointments (
    Appointment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Appointment_DateStart DATETIME NOT NULL,
    Appointment_DateEnd DATETIME NOT NULL,
    Appointment_Description VARCHAR(255),
    Worker_ID INT NOT NULL,
    Client_ID INT NOT NULL,
    
    FOREIGN KEY (Worker_ID) REFERENCES Workers(Worker_ID) ON DELETE CASCADE,
    FOREIGN KEY (Client_ID) REFERENCES Clients(Client_ID) ON DELETE CASCADE
);
