using FactoryMonitoringWeb.Data;
using FactoryMonitoringWeb.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Text;

namespace FactoryMonitoringWeb.Controllers
{
    public class PCController : Controller
    {
        private readonly FactoryDbContext _context;
        private readonly ILogger<PCController> _logger;

        public PCController(FactoryDbContext context, ILogger<PCController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IActionResult> Details(int id)
        {
            var pc = await _context.FactoryPCs
                .Include(p => p.ConfigFile)
                .Include(p => p.Models)
                .FirstOrDefaultAsync(p => p.PCId == id);

            if (pc == null)
            {
                return NotFound();
            }

            return View(pc);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateConfig(int pcId, string configContent)
        {
            try
            {
                var config = await _context.ConfigFiles.FirstOrDefaultAsync(c => c.PCId == pcId);

                if (config == null)
                {
                    return Json(new { success = false, message = "Config file not found" });
                }

                config.UpdatedContent = configContent;
                config.PendingUpdate = true;
                config.UpdateRequestTime = DateTime.Now;
                config.UpdateApplied = false;

                var command = new AgentCommand
                {
                    PCId = pcId,
                    CommandType = "UpdateConfig",
                    CommandData = configContent,
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };

                _context.AgentCommands.Add(command);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Config update queued successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating config");
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> DownloadConfig(int pcId)
        {
            try
            {
                var config = await _context.ConfigFiles.FirstOrDefaultAsync(c => c.PCId == pcId);

                if (config == null || string.IsNullOrEmpty(config.ConfigContent))
                {
                    return NotFound("Config file not found");
                }

                var pc = await _context.FactoryPCs.FindAsync(pcId);
                var fileName = $"config_Line{pc?.LineNumber ?? 0}_PC{pc?.PCNumber ?? 0}.txt";

                var bytes = Encoding.UTF8.GetBytes(config.ConfigContent);
                return File(bytes, "text/plain", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading config");
                return StatusCode(500, "Error downloading config file");
            }
        }

        [HttpPost]
        public async Task<IActionResult> ChangeModel(int pcId, string modelName)
        {
            try
            {
                var model = await _context.Models
                    .FirstOrDefaultAsync(m => m.PCId == pcId && m.ModelName == modelName);

                if (model == null)
                {
                    return Json(new { success = false, message = "Model not found" });
                }

                var command = new AgentCommand
                {
                    PCId = pcId,
                    CommandType = "ChangeModel",
                    CommandData = JsonConvert.SerializeObject(new
                    {
                        ModelName = modelName,
                        ModelPath = model.ModelPath
                    }),
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };

                _context.AgentCommands.Add(command);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Model change command queued" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing model");
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }


        [HttpPost]
        public async Task<IActionResult> DownloadModel(int pcId, string modelName)
        {
            try
            {
                var model = await _context.Models
                    .FirstOrDefaultAsync(m => m.PCId == pcId && m.ModelName == modelName);

                if (model == null)
                {
                    return Json(new { success = false, message = "Model not found" });
                }

                var command = new AgentCommand
                {
                    PCId = pcId,
                    CommandType = "DownloadModel",
                    CommandData = JsonConvert.SerializeObject(new
                    {
                        ModelName = modelName,
                        ModelPath = model.ModelPath
                    }),
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };

                _context.AgentCommands.Add(command);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Model download initiated", commandId = command.CommandId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating model download");
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        // NEW ENDPOINTS FOR UI AUTO-REFRESH
        [HttpGet]
        public async Task<IActionResult> GetModels(int pcId)
        {
            try
            {
                var models = await _context.Models
                    .Where(m => m.PCId == pcId)
                    .Select(m => new
                    {
                        modelName = m.ModelName,
                        modelPath = m.ModelPath,
                        isCurrent = m.IsCurrentModel,
                        lastUsed = m.LastUsed
                    })
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    models = models
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting models");
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetLatestConfig(int pcId)
        {
            try
            {
                var config = await _context.ConfigFiles
                    .FirstOrDefaultAsync(c => c.PCId == pcId);

                if (config == null)
                {
                    return Json(new { updated = false });
                }

                return Json(new
                {
                    updated = true,
                    configContent = config.ConfigContent,
                    lastModified = config.LastModified
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting latest config");
                return Json(new { updated = false, error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPCStatus(int pcId)
        {
            try
            {
                var pc = await _context.FactoryPCs.FindAsync(pcId);

                if (pc == null)
                {
                    return Json(new { success = false });
                }

                return Json(new
                {
                    success = true,
                    isOnline = pc.IsOnline,
                    isApplicationRunning = pc.IsApplicationRunning,
                    lastHeartbeat = pc.LastHeartbeat?.ToString("yyyy-MM-dd HH:mm:ss")
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PC status");
                return Json(new { success = false, error = ex.Message });
            }
        }

        // Location: FactoryMonitoringWeb/Controllers/PCController.cs

        [HttpPost]
        public async Task<IActionResult> DeletePC(int pcId)
        {
            try
            {
                var pc = await _context.FactoryPCs
                    .Include(p => p.ConfigFile)
                    .Include(p => p.Models)
                    .FirstOrDefaultAsync(p => p.PCId == pcId);

                if (pc == null)
                {
                    return Json(new { success = false, message = "PC not found" });
                }

                // 1. Queue the Reset Command
                var resetCmd = new AgentCommand
                {
                    PCId = pcId,
                    CommandType = "ResetAgent",
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };
                _context.AgentCommands.Add(resetCmd);

                // 2. Mark PC as "Deleting" via name or status so you know it's pending
                // (Optional but helps avoid confusion if you refresh the page)
                pc.PCNumber = -1; // Example: Set invalid number or add a status field
                pc.IsOnline = false;

                // 3. IMPORTANT: DO NOT REMOVE THE PC YET!
                // The Agent needs this record to exist to fetch the command during Heartbeat.
                // _context.FactoryPCs.Remove(pc);  <-- REMOVE OR COMMENT OUT THIS LINE

                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Deletion command sent to Agent. PC will be removed once Agent confirms reset."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting PC");
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpPost]
        public async Task<IActionResult> UpdatePC([FromBody] FactoryMonitoringWeb.Models.DTOs.PCUpdateRequest request)
        {
            try
            {
                var pc = await _context.FactoryPCs.FindAsync(request.PCId);
                if (pc == null)
                {
                    return Json(new { success = false, message = "PC not found" });
                }

                // Check for conflicts
                if (pc.LineNumber != request.LineNumber || pc.PCNumber != request.PCNumber || pc.ModelVersion != request.ModelVersion)
                {
                    var conflict = await _context.FactoryPCs.AnyAsync(p =>
                        p.PCId != request.PCId &&
                        p.LineNumber == request.LineNumber &&
                        p.PCNumber == request.PCNumber &&
                        p.ModelVersion == request.ModelVersion);

                    if (conflict)
                    {
                        return Json(new { success = false, message = "A PC with this Line/PC Number/Version combination already exists." });
                    }
                }

                // Update fields
                pc.LineNumber = request.LineNumber;
                pc.PCNumber = request.PCNumber;
                pc.IPAddress = request.IPAddress;
                pc.ConfigFilePath = request.ConfigFilePath;
                pc.LogFolderPath = request.LogFolderPath;
                pc.ModelFolderPath = request.ModelFolderPath;
                pc.ModelVersion = request.ModelVersion;
                pc.LastUpdated = DateTime.Now;

                // [ADDED] Queue command to update Agent's local config
                var agentSettings = new
                {
                    LineNumber = request.LineNumber,
                    PCNumber = request.PCNumber,
                    ModelVersion = request.ModelVersion,
                    // We don't send PCId or ServerUrl usually as they stay static, 
                    // but you can include them if needed.
                };

                var updateCmd = new AgentCommand
                {
                    PCId = pc.PCId,
                    CommandType = "UpdateAgentSettings",
                    CommandData = JsonConvert.SerializeObject(agentSettings),
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };
                _context.AgentCommands.Add(updateCmd);

                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "PC updated and sync command queued" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating PC");
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }


    }
}