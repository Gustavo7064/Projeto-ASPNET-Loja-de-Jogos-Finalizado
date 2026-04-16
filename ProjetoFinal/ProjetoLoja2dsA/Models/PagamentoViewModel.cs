using System.ComponentModel.DataAnnotations;

namespace ProjetoLoja2dsA.Models
{
    public class PagamentoViewModel
    {
        [Required(ErrorMessage = "Informe o nome completo")]
        public string ?NomeCompleto { get; set; }

        [Required(ErrorMessage = "Informe o número do cartão")]
        public string ?NumeroCartao { get; set; }

        [Required(ErrorMessage = "Informe a validade do cartão")]
        public string ?Validade { get; set; }

        [Required(ErrorMessage = "Informe o CVV")]
        public string ?CVV { get; set; }

        [Required(ErrorMessage = "Informe o valor")]
        public decimal ?Valor { get; set; }
    }
}
