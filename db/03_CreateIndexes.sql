USE FactoryMonitoringDB;
GO

-- FactoryPCs Indexes
CREATE INDEX IX_FactoryPCs_LineNumber ON FactoryPCs(LineNumber);
CREATE INDEX IX_FactoryPCs_IsOnline ON FactoryPCs(IsOnline);
CREATE INDEX IX_FactoryPCs_LastHeartbeat ON FactoryPCs(LastHeartbeat);
CREATE INDEX IX_FactoryPCs_ModelVersion ON FactoryPCs(ModelVersion);
GO

-- ConfigFiles Indexes
CREATE INDEX IX_ConfigFiles_PCId ON ConfigFiles(PCId);
CREATE INDEX IX_ConfigFiles_PendingUpdate ON ConfigFiles(PendingUpdate);
GO

-- LogFiles Indexes
CREATE INDEX IX_LogFiles_PCId ON LogFiles(PCId);
CREATE INDEX IX_LogFiles_LastModified ON LogFiles(LastModified);
GO

-- Models Indexes
CREATE INDEX IX_Models_PCId ON Models(PCId);
CREATE INDEX IX_Models_IsCurrentModel ON Models(IsCurrentModel);
CREATE INDEX IX_Models_ModelName ON Models(ModelName);
GO

-- ModelFiles Indexes
CREATE INDEX IX_ModelFiles_IsActive ON ModelFiles(IsActive);
CREATE INDEX IX_ModelFiles_UploadedDate ON ModelFiles(UploadedDate);
CREATE INDEX IX_ModelFiles_IsTemplate ON ModelFiles(IsTemplate);
GO

-- LineTargetModels Indexes
CREATE INDEX IX_LineTargetModels_LineNumber ON LineTargetModels(LineNumber);
GO

-- ModelDistributions Indexes
CREATE INDEX IX_ModelDistributions_ModelFileId ON ModelDistributions(ModelFileId);
CREATE INDEX IX_ModelDistributions_PCId ON ModelDistributions(PCId);
CREATE INDEX IX_ModelDistributions_Status ON ModelDistributions(Status);
CREATE INDEX IX_ModelDistributions_DistributionType ON ModelDistributions(DistributionType);
GO

-- AgentCommands Indexes
CREATE INDEX IX_AgentCommands_PCId ON AgentCommands(PCId);
CREATE INDEX IX_AgentCommands_Status ON AgentCommands(Status);
CREATE INDEX IX_AgentCommands_CommandType ON AgentCommands(CommandType);
CREATE INDEX IX_AgentCommands_PCId_Status ON AgentCommands(PCId, Status);
CREATE INDEX IX_AgentCommands_CreatedDate ON AgentCommands(CreatedDate);
GO

-- SystemLogs Indexes
CREATE INDEX IX_SystemLogs_PCId ON SystemLogs(PCId);
CREATE INDEX IX_SystemLogs_ActionType ON SystemLogs(ActionType);
CREATE INDEX IX_SystemLogs_Timestamp ON SystemLogs(Timestamp);
GO

PRINT 'All indexes created successfully!';
GO