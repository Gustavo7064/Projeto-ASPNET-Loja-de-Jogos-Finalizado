using Microsoft.AspNetCore.Mvc;
using ProjetoLoja2dsA.Repositorio;
using ProjetoLoja2dsA.Models;

namespace ProjetoLoja2dsA.Controllers
{
    public class UsuarioController : Controller
    {
        private readonly UsuarioRepositorio _usuarioRepositorio;

        public UsuarioController(UsuarioRepositorio usuarioRepositorio)
        {
            _usuarioRepositorio = usuarioRepositorio;
        }

        [HttpGet]
        public IActionResult Login() => View();

        [HttpPost]
        public IActionResult Login(string email, string senha)
        {
            var usuario = _usuarioRepositorio.ObterUsuario(email);

            if (usuario != null && usuario.Senha == senha)
            {
                HttpContext.Session.SetInt32("UsuarioId", usuario.Id);
                HttpContext.Session.SetString("EmailUsuario", usuario.Email);
                HttpContext.Session.SetString("NomeUsuario", usuario.Nome);
                HttpContext.Session.SetString("AvatarUrl", "/pastafotos/avatar-default.png");

                // Determina o role: usa o do banco, ou detecta pelo nome/email como fallback
                string role = usuario.Role ?? "user";
                if (role == "user" || string.IsNullOrEmpty(role))
                {
                    // Fallback: se o nome ou email indicar funcionário
                    if (usuario.Nome?.Contains("Funcionario", StringComparison.OrdinalIgnoreCase) == true ||
                        usuario.Email?.Contains("func", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        role = "Funcionario";
                    }
                }

                HttpContext.Session.SetString("UserRole", role);

                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", "E-mail ou senha inválidos. Tente novamente.");
            return View();
        }

        [HttpGet]
        public IActionResult Cadastro() => View();

        [HttpPost]
        public IActionResult Cadastro(Usuario usuario)
        {
            if (ModelState.IsValid)
            {
                _usuarioRepositorio.AdicionarUsuario(usuario);
                return RedirectToAction("Login");
            }
            return View(usuario);
        }

        [HttpGet]
        public IActionResult Editar()
        {
            var id = HttpContext.Session.GetInt32("UsuarioId");
            if (id == null) return RedirectToAction("Login");

            var usuario = _usuarioRepositorio.ObterPorId(id.Value);
            if (usuario == null) return NotFound();
            return View(usuario);
        }

        [HttpPost]
        public IActionResult Editar(Usuario usuario)
        {
            if (ModelState.IsValid)
            {
                _usuarioRepositorio.AtualizarUsuario(usuario);
                HttpContext.Session.SetString("NomeUsuario", usuario.Nome);
                HttpContext.Session.SetString("EmailUsuario", usuario.Email);
                TempData["MensagemSucesso"] = "Informações atualizadas com sucesso!";
                return RedirectToAction("Perfil");
            }
            TempData["MensagemErro"] = "Erro ao salvar alterações.";
            return View(usuario);
        }

        [HttpPost]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Perfil()
        {
            var nome = HttpContext.Session.GetString("NomeUsuario");
            var email = HttpContext.Session.GetString("EmailUsuario");
            var foto = HttpContext.Session.GetString("AvatarUrl") ?? "/pastafotos/avatar-default.png";

            if (string.IsNullOrEmpty(nome))
                return RedirectToAction("Login");

            ViewBag.Nome = nome;
            ViewBag.Email = email;
            ViewBag.Foto = foto;
            return View();
        }

        [HttpGet]
        public IActionResult ListaUsuarios()
        {
            var usuarios = _usuarioRepositorio.ListarTodos();
            return View(usuarios);
        }

        public IActionResult Index() => View();
    }
}
