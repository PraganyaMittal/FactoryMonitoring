USE FactoryMonitoringDB;
GO

CREATE PROCEDURE sp_RegisterOrUpdatePC
    @LineNumber INT,
    @PCNumber INT,
    @IPAddress NVARCHAR(50),
    @ConfigFilePath NVARCHAR(500),
    @LogFolderPath NVARCHAR(500), -- Renamed from LogFilePath
    @ModelFolderPath NVARCHAR(500),
    @ModelVersion NVARCHAR(20) = '3.5',
    @PCId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Lookup now includes ModelVersion to support multiple versions for same Line/PC
    SELECT @PCId = PCId
    FROM FactoryPCs
    WHERE LineNumber = @LineNumber
      AND PCNumber = @PCNumber
      AND ModelVersion = @ModelVersion;

    IF @PCId IS NULL
    BEGIN
        INSERT INTO FactoryPCs (
            LineNumber,
            PCNumber,
            IPAddress,
            ConfigFilePath,
            LogFolderPath,
            ModelFolderPath,
            ModelVersion,
            IsOnline,
            IsApplicationRunning,
            LastHeartbeat
        )
        VALUES (
            @LineNumber,
            @PCNumber,
            @IPAddress,
            @ConfigFilePath,
            @LogFolderPath,
            @ModelFolderPath,
            @ModelVersion,
            1,
            0,
            GETDATE()
        );

        SET @PCId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE FactoryPCs
        SET IPAddress = @IPAddress,
            ConfigFilePath = @ConfigFilePath,
            LogFolderPath = @LogFolderPath,
            ModelFolderPath = @ModelFolderPath,
            ModelVersion = @ModelVersion,
            IsOnline = 1,
            LastHeartbeat = GETDATE(),
            LastUpdated = GETDATE()
        WHERE PCId = @PCId;
    END
END
GO

PRINT 'Stored procedures created successfully!';
GO