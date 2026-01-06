/*
 * Factory Monitoring System - Sample Data
 * File: 04_SeedData.sql
 * Description: Optional sample data for testing (OPTIONAL)
 */

USE FactoryMonitoringDB;
GO

PRINT 'Seeding sample data...';
PRINT '';
PRINT 'NOTE: This is optional and for development/testing only.';
PRINT 'Comment out or skip this file in production.';
PRINT '';

-- Only seed if tables are empty
IF NOT EXISTS (SELECT 1 FROM FactoryPCs)
BEGIN
    PRINT 'Inserting sample PCs...';
    
    -- Sample PCs for Line 1, Version 3.5
    INSERT INTO FactoryPCs (LineNumber, PCNumber, ModelVersion, IPAddress, IsOnline, IsApplicationRunning, ConfigFilePath, ModelFolderPath, LogFolderPath)
    VALUES 
        (1, 1, '3.5', '192.168.1.101', 1, 1, 'C:\Factory\Config\Line1_PC1.ini', 'C:\Factory\Models', 'C:\Factory\Logs'),
        (1, 2, '3.5', '192.168.1.102', 1, 0, 'C:\Factory\Config\Line1_PC2.ini', 'C:\Factory\Models', 'C:\Factory\Logs'),
        (1, 3, '3.5', '192.168.1.103', 0, 0, 'C:\Factory\Config\Line1_PC3.ini', 'C:\Factory\Models', 'C:\Factory\Logs');
    
    -- Sample PCs for Line 1, Version 4.0
    INSERT INTO FactoryPCs (LineNumber, PCNumber, ModelVersion, IPAddress, IsOnline, IsApplicationRunning, ConfigFilePath, ModelFolderPath, LogFolderPath)
    VALUES 
        (1, 1, '4.0', '192.168.1.111', 1, 1, 'C:\Factory\Config\Line1_PC1_v4.ini', 'C:\Factory\Models', 'C:\Factory\Logs'),
        (1, 2, '4.0', '192.168.1.112', 1, 1, 'C:\Factory\Config\Line1_PC2_v4.ini', 'C:\Factory\Models', 'C:\Factory\Logs');
    
    -- Sample PCs for Line 2, Version 3.5
    INSERT INTO FactoryPCs (LineNumber, PCNumber, ModelVersion, IPAddress, IsOnline, IsApplicationRunning, ConfigFilePath, ModelFolderPath, LogFolderPath)
    VALUES 
        (2, 1, '3.5', '192.168.1.201', 1, 1, 'C:\Factory\Config\Line2_PC1.ini', 'C:\Factory\Models', 'C:\Factory\Logs'),
        (2, 2, '3.5', '192.168.1.202', 1, 1, 'C:\Factory\Config\Line2_PC2.ini', 'C:\Factory\Models', 'C:\Factory\Logs');
    
    PRINT '  ✓ Sample PCs inserted';
    
    -- Sample Model Files in Library
    PRINT 'Inserting sample model library files...';
    INSERT INTO ModelFiles (ModelName, FilePath, FileSize, Description, Category)
    VALUES 
        ('config', 'C:\Factory\Library\config.zip', 1024000, 'Standard configuration model', 'Production'),
        ('bhad', 'C:\Factory\Library\bhad.zip', 2048000, 'Enhanced bhad model', 'Testing'),
        ('project-bolt-sb1-kovecbfx', 'C:\Factory\Library\project-bolt.zip', 1536000, 'Project bolt configuration', 'Development');
    
    PRINT '  ✓ Sample model library files inserted';
    
    -- Sample deployed models
    PRINT 'Inserting sample deployed models...';
    INSERT INTO Models (PCId, ModelName, IsCurrentModel, ModelPath)
    VALUES 
        (1, 'config', 1, 'C:\Factory\Models\config'),
        (2, 'bhad', 1, 'C:\Factory\Models\bhad'),
        (4, 'config', 1, 'C:\Factory\Models\config'),
        (6, 'bhad', 1, 'C:\Factory\Models\bhad'),
        (7, 'bhad', 1, 'C:\Factory\Models\bhad');
    
    PRINT '  ✓ Sample deployed models inserted';
    
    -- Sample Line Target Models
    PRINT 'Inserting sample line target models...';
    INSERT INTO LineTargetModels (LineNumber, ModelVersion, TargetModelName, SetByUser, Notes)
    VALUES 
        (1, '3.5', 'config', 'System', 'Initial deployment'),
        (1, '4.0', 'config', 'System', 'Version 4.0 rollout'),
        (2, '3.5', 'bhad', 'System', 'Testing phase');
    
    PRINT '  ✓ Sample line target models inserted';
    
    PRINT '';
    PRINT '============================================';
    PRINT 'Sample data seeded successfully!';
    PRINT '============================================';
    PRINT '';
    PRINT 'Database is ready for use!';
END
ELSE
BEGIN
    PRINT 'Tables already contain data. Skipping seed.';
    PRINT '';
    PRINT 'To re-seed, first run:';
    PRINT '  01_CreateDatabase.sql (WARNING: Deletes all data)';
    PRINT 'Then run scripts 02-04 in order.';
END
GO
