-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-10-2025 a las 20:37:17
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `strokbig_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('natural','juridica') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `identificacion`, `nombre`, `tipo`) VALUES
(20, '1001', 'StrokBig', 'juridica');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `factura_id_visible` varchar(50) NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `total_cuotas` int(11) NOT NULL DEFAULT 1,
  `cuotas_pagadas` int(11) NOT NULL DEFAULT 0,
  `fecha_base_vencimiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id`, `cliente_id`, `factura_id_visible`, `concepto`, `monto_total`, `total_cuotas`, `cuotas_pagadas`, `fecha_base_vencimiento`) VALUES
(1, 20, 'SB-391307', 'Licencia Profesional', 2000000.00, 6, 5, '2025-11-24'),
(2, 20, 'SB-809179', 'Soporte tecnico', 120000.00, 1, 0, '2025-10-28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos_recibidos`
--

CREATE TABLE `pagos_recibidos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `referencia` varchar(50) NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `fecha_pago` timestamp NOT NULL DEFAULT current_timestamp(),
  `cuotas_pagadas_desc` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos_recibidos`
--

INSERT INTO `pagos_recibidos` (`id`, `cliente_id`, `referencia`, `monto_pagado`, `metodo_pago`, `fecha_pago`, `cuotas_pagadas_desc`) VALUES
(1, 20, 'SB-PAY-1001-1761327346294', 1000000.00, 'Wompi', '2025-10-24 17:36:04', 'SB-391307 (Cuota 1/6), SB-391307 (Cuota 2/6), SB-391307 (Cuota 3/6)'),
(2, 20, 'SB-PAY-1001-1761328982831', 666666.67, 'Wompi', '2025-10-24 18:03:21', 'SB-391307 (Cuota 4/6), SB-391307 (Cuota 5/6)');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `factura_id_visible` (`factura_id_visible`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `pagos_recibidos`
--
ALTER TABLE `pagos_recibidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referencia` (`referencia`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pagos_recibidos`
--
ALTER TABLE `pagos_recibidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pagos_recibidos`
--
ALTER TABLE `pagos_recibidos`
  ADD CONSTRAINT `pagos_recibidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
