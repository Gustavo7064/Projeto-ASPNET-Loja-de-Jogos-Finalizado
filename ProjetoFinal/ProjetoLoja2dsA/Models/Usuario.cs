using System.ComponentModel.DataAnnotations;

namespace ProjetoLoja2dsA.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Informe o nome")]
        [StringLength(40)]
        public string ?Nome { get; set; }

        [Required(ErrorMessage = "Informe o e-mail")]
        [StringLength(40)]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        public string ?Email { get; set; }

        [Required(ErrorMessage = "Informe a senha")]
        [StringLength(40)]
        public string ?Senha { get; set; }

        public string? Role { get; set; }

    }
}
