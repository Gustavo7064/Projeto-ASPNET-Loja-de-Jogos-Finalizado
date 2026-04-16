using Microsoft.AspNetCore.Mvc;
using ProjetoLoja2dsA.Models;
using ProjetoLoja2dsA.Repositorio;

namespace ProjetoLoja2dsA.Controllers
{
    public class FuncionarioController : Controller
    {
        private readonly UsuarioRepositorio _usuarioRepositorio;
        private readonly ProdutoRepositorio _produtoRepositorio;

        public FuncionarioController(UsuarioRepositorio usuarioRepositorio, ProdutoRepositorio produtoRepositorio)
        {
            _usuarioRepositorio = usuarioRepositorio;
            _produtoRepositorio = produtoRepositorio;
        }

        // Verifica se é funcionário (role ou nome como fallback)
        private bool IsFuncionario()
        {
            var role = HttpContext.Session.GetString("UserRole") ?? "";
            if (role == "Funcionario") return true;
            var nome = HttpContext.Session.GetString("NomeUsuario") ?? "";
            return nome.Contains("Funcionario", StringComparison.OrdinalIgnoreCase);
        }

        // GET: /Funcionario/AreaFuncionario
        public IActionResult AreaFuncionario()
        {
            if (!IsFuncionario())
                return RedirectToAction("Login", "Usuario");

            ViewBag.Usuarios = _usuarioRepositorio.ListarTodos();
            ViewBag.Produtos = _produtoRepositorio.ListarTodos();
            return View();
        }

        // POST: /Funcionario/AdicionarJogo
        [HttpPost]
        public async Task<IActionResult> AdicionarJogo(Produto produto, IFormFile? imagemArquivo)
        {
            if (!IsFuncionario())
                return RedirectToAction("Login", "Usuario");

            // Processar upload de imagem
            if (imagemArquivo != null && imagemArquivo.Length > 0)
            {
                var extensao = Path.GetExtension(imagemArquivo.FileName).ToLower();
                var permitidas = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
                if (permitidas.Contains(extensao))
                {
                    var nomeArquivo = Guid.NewGuid().ToString() + extensao;
                    var pasta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "pastafotos");
                    Directory.CreateDirectory(pasta);
                    var caminho = Path.Combine(pasta, nomeArquivo);
                    using var stream = new FileStream(caminho, FileMode.Create);
                    await imagemArquivo.CopyToAsync(stream);
                    produto.ImagemUrl = "/pastafotos/" + nomeArquivo;
                }
            }

            if (string.IsNullOrEmpty(produto.ImagemUrl))
                produto.ImagemUrl = "/pastafotos/avatar-default.png";

            _produtoRepositorio.AdicionarProduto(produto);
            TempData["Sucesso"] = $"Jogo \"{produto.Nome}\" adicionado ao catálogo!";
            return RedirectToAction("AreaFuncionario");
        }

        // POST: /Funcionario/ExcluirJogo
        [HttpPost]
        public IActionResult ExcluirJogo(int id)
        {
            if (!IsFuncionario())
                return RedirectToAction("Login", "Usuario");

            _produtoRepositorio.ExcluirProduto(id);
            TempData["Sucesso"] = "Jogo removido do catálogo.";
            return RedirectToAction("AreaFuncionario");
        }

        // GET: /Funcionario/EditarUsuario/5
        [HttpGet]
        public IActionResult EditarUsuario(int id)
        {
            if (!IsFuncionario())
                return RedirectToAction("Login", "Usuario");

            var usuario = _usuarioRepositorio.ObterPorId(id);
            if (usuario == null) return NotFound();
            return View(usuario);
        }

        // POST: /Funcionario/EditarUsuario
        [HttpPost]
        public IActionResult EditarUsuario(Usuario usuario)
        {
            if (!IsFuncionario())
                return RedirectToAction("Login", "Usuario");

            _usuarioRepositorio.AtualizarUsuario(usuario);
            TempData["Sucesso"] = $"Usuário \"{usuario.Nome}\" atualizado!";
            return RedirectToAction("AreaFuncionario");
        }

        public IActionResult Index() => RedirectToAction("AreaFuncionario");
    }
}
