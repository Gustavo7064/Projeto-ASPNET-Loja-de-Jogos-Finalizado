using Microsoft.AspNetCore.Mvc;
using ProjetoLoja2dsA.Models;

namespace ProjetoLoja2dsA.Controllers
{
    public class PagamentoController : Controller
    {
        // GET: /Pagamento/FazerPagamento
        [HttpGet]
        public IActionResult FazerPagamento()
        {
            var vm = new PagamentoViewModel();

            // TODO: aqui você pode calcular o total com base no carrinho do usuário
            vm.Valor = 120.50m; // valor de exemplo

            return View(vm); // procura Views/Pagamento/FazerPagamento.cshtml
        }

        // POST: /Pagamento/FazerPagamento
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult FazerPagamento(PagamentoViewModel model)
        {
            if (!ModelState.IsValid)
            {
                // Volta pra tela mostrando os erros
                return View(model);
            }

            // Simulação de pagamento aprovado
            bool pago = true;

            if (!pago)
            {
                ModelState.AddModelError("", "Pagamento recusado. Tente novamente.");
                return View(model);
            }

            // Aqui você poderia:
            // - Gravar pedido no banco
            // - Limpar carrinho (localStorage é no front, então depois podemos tratar)

            TempData["Mensagem"] = "Pagamento realizado com sucesso!";

            return RedirectToAction("Sucesso");
        }

        public IActionResult Sucesso()
        {
            return View(); // Views/Pagamento/Sucesso.cshtml
        }
    }
}
