<?php
/**
 * Process Manager.
 *
 * LICENSE
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2015-2017 Wojciech Peisert (http://divante.co/)
 * @license    https://github.com/dpfaffenbauer/ProcessManager/blob/master/gpl-3.0.txt GNU General Public License version 3 (GPLv3)
 */

namespace ProcessManagerBundle\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use ProcessManagerBundle\Model\ExecutableInterface;
use ProcessManagerBundle\Tool\Report;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class ProcessReportController extends AdminController
{
    /**
     * @Route("/admin/process_manager/reports/get")
     * @param Request $request
     * @return JsonResponse
     */
    public function getReportAction(Request $request)
    {
        $id = $request->get('id');
        $report = new Report($id);
        return $this->json(
            ['report' =>
                [
                    'title' => 'Report for process: ' . $id,
                    'html'  => $report->getReportHtml()
                ]
            ]
        );
    }

}