import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout.jsx';
import { Home } from '../pages/Home.jsx';
import { ArticleGEM } from '../pages/ArticleGEM.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog/gem" element={<ArticleGEM />} />
      </Route>
    </Routes>
  );
}
