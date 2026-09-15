const STOCK_DECREASE_TYPES = new Set(["SALE", "RESERVATION", "EXPIRED"]);
const STOCK_INCREASE_TYPES = new Set(["PURCHASE", "RESERVATION_RELEASE"]);

const getTransactionDelta = (transaction) => {
  if (STOCK_DECREASE_TYPES.has(transaction.type)) return -transaction.quantity;
  if (STOCK_INCREASE_TYPES.has(transaction.type)) return transaction.quantity;
  return transaction.quantity;
};

const getBatchAvailableQuantity = (batch) => {
  return (batch.transactions || []).reduce((total, transaction) => {
    return total + getTransactionDelta(transaction);
  }, 0);
};

const getAvailableQuantity = (batches) => {
  return batches.reduce((total, batch) => total + getBatchAvailableQuantity(batch), 0);
};

module.exports = {
  getBatchAvailableQuantity,
  getAvailableQuantity,
};
