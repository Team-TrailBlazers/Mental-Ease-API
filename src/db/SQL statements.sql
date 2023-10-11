-- Create Users Table
Drop table Users

CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    EmailAddress VARCHAR(100),
    HashedPassword VARCHAR(255), 
    RegistrationDate DATETIME,
    ProfilePicture VARCHAR(MAX), 
    Role VARCHAR(20) CHECK (Role IN ('user', 'therapist', 'admin')) DEFAULT 'user'
);

--Add IsTherapist column to Users table
ALTER TABLE Users ADD IsTherapist BIT DEFAULT 0;

-- Create trigger to insert therapist into Therapists table when user is updated
GO
CREATE TRIGGER UpdateUserToTherapist
ON Users
AFTER UPDATE
AS
BEGIN
  IF UPDATE(IsTherapist) AND EXISTS (SELECT * FROM inserted WHERE IsTherapist = 1)
  BEGIN
    INSERT INTO Therapists (FirstName, LastName, EmailAddress, HashedPassword, LicenseNumber, Specialization, Location, TreatmentApproach, ProfilePicture)
    SELECT FirstName, LastName, EmailAddress, HashedPassword, NULL, NULL, NULL, NULL, NULL
    FROM inserted
    WHERE IsTherapist = 1
      AND NOT EXISTS (SELECT * FROM Therapists WHERE EmailAddress = inserted.EmailAddress);
  END
END;
GO

Drop table Therapists
-- Create Therapists Table
CREATE TABLE Therapists (
    TherapistID INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    EmailAddress VARCHAR(100),
	HashedPassword VARCHAR(255), 
    LicenseNumber VARCHAR(50),
    Specialization VARCHAR(100),
    Location VARCHAR(100),
    TreatmentApproach VARCHAR(100),
    ProfilePicture VARCHAR(MAX)
);

-- DROP TRIGGER DeleteTherapist;
select * from Appointments;
Drop table Appointments
-- Create Appointments Table
CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    TherapistID INT,
    AppointmentDate DATE,
    AppointmentTime TIME,
    Duration INT;
    Price DECIMAL(10, 2),
    MessageText VARCHAR(MAX),
    AppointmentStatus VARCHAR(20), -- 'scheduled', 'completed', 'canceled'
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TherapistID) REFERENCES Therapists(TherapistID) ON DELETE CASCADE
);
-- adding the MessageText
 ALTER TABLE Appointments ADD MessageText VARCHAR(MAX);
ALTER TABLE Appointments ADD Price DECIMAL(10, 2);
ALTER TABLE Appointments ADD Duration INT; 




Drop table ChatMessages
-- Create ChatMessages Table
CREATE TABLE ChatMessages (
    MessageID INT PRIMARY KEY IDENTITY(1,1),
    SenderID INT,
    ReceiverID INT,
    MessageContent VARCHAR(MAX),
    Timestamp DATE,
    FOREIGN KEY (SenderID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverID) REFERENCES Users(UserID) 
);
Drop table Resources
-- Create Resources Table
CREATE TABLE Resources (
    ResourceID INT PRIMARY KEY IDENTITY(1,1),
    Title VARCHAR(100),
    Description VARCHAR(MAX),
    Category VARCHAR(50), -- 'articles', 'videos'
    PhotoURL VARCHAR(MAX), 
    VideoURL VARCHAR(MAX),
    Timestamp DATETIME
);

Drop table SupportGroups;
-- Create Support Groups Table
CREATE TABLE SupportGroups (
    GroupID INT PRIMARY KEY IDENTITY(1,1),
    GroupName VARCHAR(100),
    Description VARCHAR(MAX),
    Timestamp DATE
);
Drop table GroupMembers
-- Create Group Members Table
CREATE TABLE GroupMembers (
    MemberID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    GroupID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GroupID) REFERENCES SupportGroups(GroupID) ON DELETE CASCADE
);

Drop table GroupChatMessages
-- Create Group Chat Messages Table
CREATE TABLE GroupChatMessages (
    MessageID INT PRIMARY KEY IDENTITY(1,1),
    SenderID INT,
    GroupID INT, 
    MessageContent VARCHAR(MAX),
    Timestamp DATE,
    FOREIGN KEY (SenderID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GroupID) REFERENCES SupportGroups(GroupID) ON DELETE CASCADE
);

-- Create FAQ Table
CREATE TABLE FAQ (
    FAQID INT PRIMARY KEY IDENTITY(1,1),
    Question VARCHAR(MAX),
    Answer VARCHAR(MAX)
);


						--Users
-- CRUD Functionality Users Table
--CREATE/ INSERT
INSERT INTO Users (FirstName, LastName, EmailAddress, HashedPassword, RegistrationDate, ProfilePicture, Role)
VALUES ('Bian', 'Kemboi', 'bkemboi590@gmail.com', 'pass123', GETDATE(), 'picture_url', 'admin');

--READ
SELECT * FROM Users;


--UPDATE
UPDATE Users
SET FirstName = 'Ann', LastName = 'Wanjiru'
WHERE UserID = 2;

--UPDATE
UPDATE Users
SET Role = 'admin'
WHERE UserID = 7;
--DELETE
DELETE FROM Users
WHERE UserID = 2;


						--Therapists
-- CRUD Functionality Therapist Table
--CREATE/ INSERT
INSERT INTO Therapists (FirstName, LastName, EmailAddress, HashedPassword, LicenseNumber, Specialization, Location, TreatmentApproach, ProfilePicture)
VALUES ('Dr. Ann', 'Wanjiru', 'Ann@gmail.com', 'pass123', '12345', 'Psychology', 'Nairobi', 'Cognitive Behavioral Therapy', 'picture_url');

--READ
SELECT * FROM Therapists;

--UPDATE
UPDATE Therapists
SET Specialization = 'Stress management'
WHERE TherapistID = 2;

--DELETE
DELETE FROM Therapists
WHERE TherapistID = 2;

					--Appointments
-- CRUD Functionality Appointments Table
--CREATE/ INSERT
INSERT INTO Appointments (UserID, TherapistID, AppointmentDate, AppointmentTime, MessageText, AppointmentStatus)
VALUES (14, 5, '2023-09-28', '10:00:00', 'I have a problem', 'scheduled');

--READ
SELECT * FROM Appointments;
SELECT * FROM Therapists;
SELECT * FROM Users;

--UPDATE
UPDATE Appointments
SET AppointmentStatus = 'completed'
WHERE AppointmentID = 1;

--DELETE
DELETE FROM Appointments
WHERE AppointmentID = 2;
						
							----ChatMessages
-- CRUD Functionality ChatMessages Table
--CREATE/ INSERT 
-- Assuming SenderID and ReceiverID exist in the Users table
INSERT INTO ChatMessages (SenderID, ReceiverID, MessageContent, Timestamp)
VALUES (1, 1, 'Hello, kemboi!', GETDATE());

--READ
SELECT * FROM ChatMessages;


							
--UPDATE
UPDATE ChatMessages
SET MessageContent = 'How are you?'
WHERE ReceiverID = 3;

--DELETE
DELETE FROM ChatMessages
WHERE SenderID = 1;

						--Resources
-- CRUD Functionality ChatMessages Table
--CREATE/ INSERT 
INSERT INTO Resources (Title, Description, Category, PhotoURL, VideoURL, Timestamp)
VALUES ('Introduction to Psychology', 'A beginner-friendly guide to psychology.', 'articles', 'photo_url_here', NULL, GETDATE());

--READ
SELECT * FROM Resources;

--UPDATE
UPDATE Resources
SET Description = 'Mental Ease Platform'
WHERE ResourceID = 1;

--DELETE
DELETE FROM Resources
WHERE ResourceID = 1;


						--SupportGroups
-- CRUD Functionality SupportGroups Table
--CREATE/ INSERT 
INSERT INTO SupportGroups (GroupName, Description, Timestamp)
VALUES ('Anxiety Support Group', 'A group for individuals dealing with anxiety.', GETDATE());

--READ
SELECT * FROM SupportGroups;

--UPDATE
UPDATE SupportGroups
SET Description = 'Mental Ease Platform'
WHERE GroupID = 1;

--DELETE
DELETE FROM SupportGroups
WHERE GroupID = 2

				--GroupMembers
-- CRUD Functionality ChatMessages Table
--CREATE/ INSERT 
INSERT INTO GroupMembers (UserID, GroupID)
VALUES (1, 1);

--READ
SELECT * FROM GroupMembers;

--UPDATE
UPDATE GroupMembers
SET UserID = 3
WHERE UserID = 1;

--DELETE DELETE MEMBER BY ID
DELETE FROM GroupMembers
WHERE MemberID = 3
--DELETE GROUP BY ID
DELETE FROM GroupMembers
WHERE GroupID = 1
--DELETE A USER WILL DELETE HIM FROM A GROUP
DELETE FROM GroupMembers
WHERE UserID = 1



					--GroupChatMessages
-- CRUD Functionality GroupChatMessages Table
--CREATE/ INSERT 
INSERT INTO GroupChatMessages (SenderID, GroupID, MessageContent, Timestamp)
VALUES (1, 1, 'Hello, members!', GETDATE());

--READ
SELECT * FROM GroupChatMessages;

--UPDATE
UPDATE GroupChatMessages
SET SenderID = 1
WHERE SenderID = 1;

UPDATE GroupChatMessages
SET MessageContent = 'How is evryone'
WHERE SenderID = 3;


--DELETE DELETE MEMBER BY ID
--DELETING GROUP MESSAGES
DELETE FROM GroupChatMessages
WHERE GroupID = 1
--DELETING USERS MESSAGES
DELETE FROM GroupChatMessages
WHERE SenderID = 3



							--FAQs
-- CRUD Functionality GroupChatMessages Table
--CREATE/ INSERT 
--FAQs
INSERT INTO FAQ (Question, Answer)
VALUES ('What is the purpose of this platform?', 'This platform aims to provide support and resources for individuals dealing with mental health challenges.');

--READ
SELECT * FROM FAQ;

--UPDATE
UPDATE FAQ
SET Question = 'What is Mental Ease'
WHERE FAQID = 1;

--DELETE
DELETE FROM FAQ
WHERE FAQID = 1
