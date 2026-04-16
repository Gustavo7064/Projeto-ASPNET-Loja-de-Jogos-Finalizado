using Microsoft.AspNetCore.Mvc;

namespace ProjetoLoja2dsA.Controllers
{
    public class ClienteController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Jogos()
        {
            return View();
        }
    }
}
