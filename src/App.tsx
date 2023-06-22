import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  cloud,
  cloudDownload,
  cloudDownloadOutline,
  cloudOutline,
  cloudUpload,
  cloudUploadOutline,
  ellipse,
  ellipsisVerticalOutline,
  logIn,
  logOut,
  settings,
  settingsOutline,
} from "ionicons/icons"; // Import the required icons

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import Dashboard from "./pages/Dashboard";
import In from "./pages/StockIn";
import Out from "./pages/Out";
import Settings from "./pages/Settings";
import Category from "./pages/Category";
import Product from "./pages/Product";
import LoginPage from "./pages/Login";
import RegistrationPage from "./pages/Register";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useMyStore } from "./store/store";
import { useEffect, useState } from "react";
import { getDocs, query, where } from "firebase/firestore";
import { getDocsByQuery } from "./operations";
import _ from "lodash";
import CategoryEditPage from "./pages/CategoryEditPage";
import { Inventory } from "./schema";
import ProductEditPage from "./pages/ProductEditPage";
import SupplierListPage from "./pages/Supplier";
import SupplierEditPage from "./pages/SupplierEditPage";
import StockInListPage from "./pages/StockIn";
import StockOutListPage from "./pages/StockOut";
import StockOutEditPage from "./pages/StockOutEditForm";
import StockInEditPage from "./pages/StockInEditForm";
import ExpenseListPage from "./pages/Expense";
import ExpenseEditPage from "./pages/ExpenseEditForm";

setupIonicReact();

const ProtectedRoute: React.FC<{
  exact: boolean;
  path: string;
  component: React.ComponentType<any>;
  authenticated: boolean;
}> = ({ component: Component, authenticated, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      authenticated ? <Component {...props} /> : <Redirect to="/login" />
    }
  />
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useMyStore((s) => s.userStore.user);
  const [inventory, setInventory] = useMyStore(
    (s) => s.userStore.activeInventory
  );
  const [inventories, setInventories] = useMyStore(
    (s) => s.userStore.inventories
  );

  useEffect(() => {
    async function getInventory(userId?: string) {
      if (userId) {
        const invs = await getDocsByQuery<Inventory>(
          "inventories",
          where("userId", "==", userId)
        );
        setInventories(invs);
        setInventory(_.first(invs));
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ?? undefined);
      if (user) {
        getInventory(user?.uid);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegistrationPage} />
        {user ? (
          <IonTabs>
            <IonRouterOutlet>
              <ProtectedRoute
                exact
                path="/dashboard"
                component={Dashboard}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/settings"
                component={Settings}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/products"
                component={Product}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/products/:productId"
                component={ProductEditPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/categories"
                component={Category}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/categories/:categoryId"
                component={CategoryEditPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/suppliers"
                component={SupplierListPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/suppliers/:supplierId"
                component={SupplierEditPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/stockIns"
                component={StockInListPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/stockIns/:stockInId"
                component={StockInEditPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/stockOuts"
                component={StockOutListPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/stockOuts/:stockOutId"
                component={StockOutEditPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/expenses"
                component={ExpenseListPage}
                authenticated={!!user}
              />
              <ProtectedRoute
                exact
                path="/expenses/:expensesId"
                component={ExpenseEditPage}
                authenticated={!!user}
              />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="dashboard" href="/dashboard">
                <IonIcon aria-hidden="true" icon={cloudOutline} />
                <IonLabel>Dashboard</IonLabel>
              </IonTabButton>
              <IonTabButton tab="in" href="/stockIns">
                <IonIcon aria-hidden="true" icon={cloudUploadOutline} />
                <IonLabel>In</IonLabel>
              </IonTabButton>
              <IonTabButton tab="out" href="/stockOuts">
                <IonIcon aria-hidden="true" icon={cloudDownloadOutline} />
                <IonLabel>Out</IonLabel>
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings">
                <IonIcon aria-hidden="true" icon={ellipsisVerticalOutline} />
                <IonLabel>Settings</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        ) : undefined}
        <Route exact path="/">
          {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
        </Route>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
