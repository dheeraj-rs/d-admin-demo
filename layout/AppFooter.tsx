import { useContext } from 'react';
import { LayoutContext } from './context/LayoutContext';
import { useLanguage } from '../lib/i18n';

const AppFooter = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const { t } = useLanguage();

  return (
    <div className="layout__footer">
      <div className="footer-brand">
        <img
          src={`/layout/logo-${layoutConfig.colorScheme === 'dark' ? 'dark' : 'white'}.svg`}
          alt="Logo"
        />
        <span>D-Admin</span>
        <span className="dashboard-text">{t('dashboard.title')} • ©</span>
        <span>{new Date().getFullYear()}</span>
      </div>
      <div className="footer-links">
        <a href="#">{t('footer.help')}</a>
        <a href="#">{t('footer.privacy')}</a>
        <a href="#">{t('footer.terms')}</a>
      </div>
    </div>
  );
};

export default AppFooter;