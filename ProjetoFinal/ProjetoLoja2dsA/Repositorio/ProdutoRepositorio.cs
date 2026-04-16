using MySql.Data.MySqlClient;
using ProjetoLoja2dsA.Models;

namespace ProjetoLoja2dsA.Repositorio
{
    public class ProdutoRepositorio(IConfiguration configuration)
    {
        private readonly string _conexaoMySQL = configuration.GetConnectionString("ConexaoMySQL");

        public void AdicionarProduto(Produto produto)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = conexao.CreateCommand();
            cmd.CommandText = "INSERT INTO Produto (nome, descricao, preco, categoria, imagemurl) VALUES (@nome, @descricao, @preco, @categoria, @imagemurl)";
            cmd.Parameters.AddWithValue("@nome", produto.Nome);
            cmd.Parameters.AddWithValue("@descricao", produto.Descricao);
            cmd.Parameters.AddWithValue("@preco", produto.Preco);
            cmd.Parameters.AddWithValue("@categoria", produto.Categoria);
            cmd.Parameters.AddWithValue("@imagemurl", produto.ImagemUrl ?? "");
            cmd.ExecuteNonQuery();
        }

        public List<Produto> ListarTodos()
        {
            var lista = new List<Produto>();
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand("SELECT * FROM Produto ORDER BY Id DESC", conexao);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                lista.Add(new Produto
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Nome = reader["Nome"].ToString(),
                    Descricao = reader["Descricao"].ToString(),
                    Preco = Convert.ToDecimal(reader["Preco"]),
                    Categoria = reader["Categoria"].ToString(),
                    ImagemUrl = reader["imagemurl"]?.ToString()
                });
            }
            return lista;
        }

        public Produto? ObterPorId(int id)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand("SELECT * FROM Produto WHERE Id = @id", conexao);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Produto
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Nome = reader["Nome"].ToString(),
                    Descricao = reader["Descricao"].ToString(),
                    Preco = Convert.ToDecimal(reader["Preco"]),
                    Categoria = reader["Categoria"].ToString(),
                    ImagemUrl = reader["imagemurl"]?.ToString()
                };
            }
            return null;
        }

        public void AtualizarProduto(Produto produto)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand(
                "UPDATE Produto SET nome=@nome, descricao=@descricao, preco=@preco, categoria=@categoria, imagemurl=@imagemurl WHERE Id=@id",
                conexao);
            cmd.Parameters.AddWithValue("@nome", produto.Nome);
            cmd.Parameters.AddWithValue("@descricao", produto.Descricao);
            cmd.Parameters.AddWithValue("@preco", produto.Preco);
            cmd.Parameters.AddWithValue("@categoria", produto.Categoria);
            cmd.Parameters.AddWithValue("@imagemurl", produto.ImagemUrl ?? "");
            cmd.Parameters.AddWithValue("@id", produto.Id);
            cmd.ExecuteNonQuery();
        }

        public void ExcluirProduto(int id)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand("DELETE FROM Produto WHERE Id=@id", conexao);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.ExecuteNonQuery();
        }
    }
}
