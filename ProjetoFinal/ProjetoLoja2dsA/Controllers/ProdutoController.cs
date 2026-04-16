using Microsoft.AspNetCore.Mvc;
using ProjetoLoja2dsA.Models;
using ProjetoLoja2dsA.Repositorio;

namespace ProjetoLoja2dsA.Controllers
{
    public class ProdutoController : Controller

    {
        private readonly ProdutoRepositorio _produtoRepositorio;

        public ProdutoController(ProdutoRepositorio produtoRepositorio)
        {
            
            _produtoRepositorio = produtoRepositorio;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult CadastroProduto()
        {
            return View();
        }


        [HttpPost]

        public IActionResult CadastroProduto(Produto produto)
        {
            if (ModelState.IsValid)
            {
                _produtoRepositorio.AdicionarProduto(produto);

                // depois de cadastrar, vai pra página de jogos do cliente
                return RedirectToAction("Jogos", "Cliente");
            }

            return View(produto);
        }


    }
}
