import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./AdminTransactions.css";

function AdminTransactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/edutech/login");
      return;
    }

    try {
      setError("");

      const response = await api.get(
        "/api/edutech/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      setError("Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-KE");
  };

  const filteredTransactions =
    transactions.filter((transaction) => {
      const searchTerm =
        search.toLowerCase();

      return (
        transaction.transaction_type
          ?.toLowerCase()
          .includes(searchTerm) ||

        transaction.description
          ?.toLowerCase()
          .includes(searchTerm) ||

        String(transaction.user_id)
          .includes(searchTerm)
      );
    });

  if (loading) {
    return (
      <div className="admin-transactions-loading">
        <div className="admin-transactions-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="admin-transactions">

      <header className="admin-transactions-header">

        <div>
          <h1>Transactions</h1>
          <p>
            All platform transaction records.
          </p>
        </div>

        <button
          type="button"
          className="admin-transactions-back-btn"
          onClick={() => navigate("/edutech")}
        >
          Dashboard
        </button>

      </header>

      <main className="admin-transactions-content">

        <div className="admin-transactions-toolbar">

          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="admin-transactions-search"
          />

          <button
            type="button"
            className="admin-transactions-refresh-btn"
            onClick={fetchTransactions}
          >
            Refresh
          </button>

        </div>

        {error && (
          <div className="admin-transactions-error">
            {error}
          </div>
        )}

        <div className="admin-transactions-table-container">

          <table className="admin-transactions-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.map(
                (transaction) => (
                  <tr key={transaction.id}>

                    <td>
                      #{transaction.id}
                    </td>

                    <td>
                      User #{transaction.user_id}
                    </td>

                    <td>
                      <span className="transaction-type">
                        {transaction.transaction_type}
                      </span>
                    </td>

                    <td className="transaction-amount">
                      KES{" "}
                      {formatAmount(
                        transaction.amount
                      )}
                    </td>

                    <td>
                      {transaction.description}
                    </td>

                    <td>
                      {formatDate(
                        transaction.created_at
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default AdminTransactions;