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
 * @author Wojciech Peisert <wpeisert@divante.pl>
 * @license    https://github.com/dpfaffenbauer/ProcessManager/blob/master/gpl-3.0.txt GNU General Public License version 3 (GPLv3)
 */

namespace ProcessManagerBundle\Process;

/**
 * Class RunManager
 * @package ProcessManagerBundle\Process
 */
class RunManager
{
    /**
     * @param string $hash
     */
    public function setStopProcess(string $hash)
    {
        file_put_contents($this->getFilePath($hash), strftime('%Y-%m-%d %T'));
    }

    /**
     * @param string $hash
     * @return bool
     */
    public function getStopProcess(string $hash): bool
    {
        return file_exists($this->getFilePath($hash));
    }

    /**
     * @param string $hash
     * @return string
     */
    private function getFilePath(string $hash): string
    {
        $path = PIMCORE_TEMPORARY_DIRECTORY . "/stop_" . $hash . '.txt';

        return $path;
    }
}
