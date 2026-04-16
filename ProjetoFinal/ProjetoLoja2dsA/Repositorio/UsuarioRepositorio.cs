using MySql.Data.MySqlClient;
using ProjetoLoja2dsA.Models;
using System.Data;

namespace ProjetoLoja2dsA.Repositorio
{
    public class UsuarioRepositorio(IConfiguration configuration)
    {
        private readonly string _conexaoMySQL = configuration.GetConnectionString("ConexaoMySQL");

        public void AdicionarUsuario(Usuario usuario)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = conexao.CreateCommand();
            cmd.CommandText = "INSERT INTO Usuario (email, senha, nome) VALUES (@email, @senha, @nome)";
            cmd.Parameters.Add("@email", MySqlDbType.VarChar).Value = usuario.Email;
            cmd.Parameters.Add("@senha", MySqlDbType.VarChar).Value = usuario.Senha;
            cmd.Parameters.AddWithValue("@nome", usuario.Nome);
            cmd.ExecuteNonQuery();
        }

        public Usuario ObterUsuario(string email)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand("SELECT * FROM Usuario WHERE Email = @email", conexao);
            cmd.Parameters.Add("@email", MySqlDbType.VarChar).Value = email;

            using var dr = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            if (dr.Read())
            {
                // Tenta ler o role — se a coluna não existir, usa "user"
                string role = "user";
                try { role = dr["role"]?.ToString() ?? "user"; } catch { }

                return new Usuario
                {
                    Id    = Convert.ToInt32(dr["id"]),
                    Nome  = dr["nome"].ToString(),
                    Email = dr["email"].ToString(),
                    Senha = dr["senha"].ToString(),
                    Role  = role
                };
            }
            return null;
        }

        public Usuario ObterPorId(int id)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand("SELECT * FROM Usuario WHERE id = @id", conexao);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                string role = "user";
                try { role = reader["role"]?.ToString() ?? "user"; } catch { }

                return new Usuario
                {
                    Id    = Convert.ToInt32(reader["id"]),
                    Nome  = reader["nome"].ToString(),
                    Email = reader["email"].ToString(),
                    Senha = reader["senha"].ToString(),
                    Role  = role
                };
            }
            return null;
        }

        public void AtualizarUsuario(Usuario usuario)
        {
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand(
                "UPDATE Usuario SET nome=@nome, email=@email, senha=@senha WHERE id=@id", conexao);
            cmd.Parameters.AddWithValue("@nome", usuario.Nome);
            cmd.Parameters.AddWithValue("@email", usuario.Email);
            cmd.Parameters.AddWithValue("@senha", usuario.Senha);
            cmd.Parameters.AddWithValue("@id", usuario.Id);
            cmd.ExecuteNonQuery();
        }

        public List<Usuario> ListarTodos()
        {
            var lista = new List<Usuario>();
            using var conexao = new MySqlConnection(_conexaoMySQL);
            conexao.Open();
            var cmd = new MySqlCommand("SELECT * FROM Usuario", conexao);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                string role = "user";
                try { role = reader["role"]?.ToString() ?? "user"; } catch { }

                lista.Add(new Usuario
                {
                    Id    = Convert.ToInt32(reader["id"]),
                    Nome  = reader["nome"].ToString(),
                    Email = reader["email"].ToString(),
                    Senha = reader["senha"].ToString(),
                    Role  = role
                });
            }
            return lista;
        }
    }
}
