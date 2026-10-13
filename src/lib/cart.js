export const initialCart = { items: [], loaded: false };

export function cartReducer(state, action) {
  switch (action.type) {
    case "load":
      return { items: action.items, loaded: true };

    case "add": {
      const existing = state.items.find((item) => item.id === action.dish.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === existing.id ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      }
      const { id, name, price } = action.dish;
      return { ...state, items: [...state.items, { id, name, price, qty: 1 }] };
    }

    case "increment":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, qty: item.qty + 1 } : item
        ),
      };

    case "decrement":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.id ? { ...item, qty: item.qty - 1 } : item
          )
          .filter((item) => item.qty > 0),
      };

    case "remove":
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };

    case "clear":
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}